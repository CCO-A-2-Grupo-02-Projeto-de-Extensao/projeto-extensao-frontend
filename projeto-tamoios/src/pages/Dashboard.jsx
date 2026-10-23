import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import { Avatar } from "../components/Avatar/Avatar.jsx";
import { Button } from "../components/Button/Button.jsx";
import { CalendarioAcademico } from "../components/CalendarioAcademico/CalendarioAcademico.jsx";
import { ConfirmacaoModal } from "../components/ConfirmacaoModal/ConfirmacaoModal.jsx";
import { EscolhaEscopo } from "../components/EscolhaEscopo/EscolhaEscopo.jsx";
import { Esqueleto } from "../components/Esqueleto/Esqueleto.jsx";
import { EventoDetalheModal } from "../components/EventoDetalheModal/EventoDetalheModal.jsx";
import { EventoFormModal } from "../components/EventoFormModal/EventoFormModal.jsx";
import { SeloFeriado } from "../components/SeloFeriado/SeloFeriado.jsx";
import { useEstadoDaTela } from "../hooks/useEstadoDaTela.js";
import {
  atualizarEvento,
  criarEvento,
  deletarEvento,
} from "../services/chamadasService.js";
import { getDadosDashboard } from "../services/dashboardService.js";
import { getFeriados } from "../services/feriadosService.js";
import { paraChaveData } from "../utils/datas.js";
import { lerUsuarioLogado } from "../utils/sessao.js";
import detalhe from "../styles/desbravadorDetalhePage.module.css";
import desbravadores from "../styles/desbravadoresPage.module.css";
import styles from "../styles/dashboard.module.css";

const LIMITE_PROXIMOS = 4;
const LIMITE_DIAS_EVENTO = 60;

const formatoDia = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});
const formatoMes = new Intl.DateTimeFormat("pt-BR", { month: "long" });
const formatoMesCurto = new Intl.DateTimeFormat("pt-BR", { month: "short" });

const NOMES_REPETICAO = {
  SEMANAL: "toda semana",
  QUINZENAL: "a cada 2 semanas",
  MENSAL: "todo mês",
};

function paraData(texto) {
  const [ano, mes, dia] = texto.slice(0, 10).split("-").map(Number);
  return new Date(ano, mes - 1, dia);
}

function diasDoEvento(evento) {
  const dias = [];
  const dia = paraData(evento.inicio);
  const fim = paraData(evento.fim);
  while (dia <= fim && dias.length < LIMITE_DIAS_EVENTO) {
    dias.push(paraChaveData(dia));
    dia.setDate(dia.getDate() + 1);
  }
  return dias;
}

function periodo(evento) {
  if (evento.inicio === evento.fim) return evento.tipo;
  const fim = paraData(evento.fim);
  const ate = `até ${fim.getDate()} de ${formatoMes.format(fim)}`;
  return evento.tipo ? `${evento.tipo} · ${ate}` : ate;
}

function intervalo(evento) {
  const inicio = paraData(evento.inicio);
  const fim = paraData(evento.fim);
  const diaEMes = (data) => `${data.getDate()} de ${formatoMes.format(data)}`;
  if (evento.inicio === evento.fim) return diaEMes(inicio);
  if (inicio.getMonth() === fim.getMonth()) {
    return `${inicio.getDate()} a ${diaEMes(fim)}`;
  }
  return `${diaEMes(inicio)} a ${diaEMes(fim)}`;
}

function resumoRepeticao(evento) {
  if (!evento.repeticao) return evento.serie ? "Faz parte de uma série." : null;
  const regra = `Repete ${NOMES_REPETICAO[evento.repeticao]}`;
  if (!evento.repetirAte) return `${regra}, sem data final.`;
  const ate = paraData(evento.repetirAte);
  return `${regra} até ${ate.getDate()} de ${formatoMes.format(ate)} de ${ate.getFullYear()}.`;
}

function Dashboard() {
  const navegar = useNavigate();
  const usuario = lerUsuarioLogado();
  const primeiroNome = (usuario.nomePessoa || "").split(" ")[0];

  const agora = new Date();
  const hojeChave = paraChaveData(agora);
  const [dataSelecionada, setDataSelecionada] = useEstadoDaTela(
    "dataSelecionada",
    agora
  );
  const [mesExibido, setMesExibido] = useEstadoDaTela(
    "mesExibido",
    new Date(agora.getFullYear(), agora.getMonth(), 1)
  );

  const [dados, setDados] = useState(null);
  const [formulario, setFormulario] = useState(null);
  const [eventoAberto, setEventoAberto] = useState(null);
  const [eventoAExcluir, setEventoAExcluir] = useState(null);
  const [escopoExclusao, setEscopoExclusao] = useState("ESTE");
  const [erroAgenda, setErroAgenda] = useState("");
  const [feriados, setFeriados] = useState({});

  const carregar = () => getDadosDashboard().then(setDados);

  useEffect(() => {
    void carregar();
  }, []);

  const anoExibido = mesExibido.getFullYear();
  const mesDoAno = mesExibido.getMonth();

  useEffect(() => {
    const anos = new Set([
      mesDoAno === 0 ? anoExibido - 1 : anoExibido,
      anoExibido,
      mesDoAno === 11 ? anoExibido + 1 : anoExibido,
    ]);
    let valido = true;
    Promise.all([...anos].map(getFeriados)).then((listas) => {
      if (!valido) return;
      setFeriados((atuais) => ({
        ...atuais,
        ...Object.fromEntries(listas.flat().map(({ data, nome }) => [data, nome])),
      }));
    });
    return () => {
      valido = false;
    };
  }, [anoExibido, mesDoAno]);

  const membrosAtivos = useMemo(
    () => dados?.membros?.filter((membro) => membro.ativo) ?? null,
    [dados]
  );

  const contarCategoria = (categoria) =>
    membrosAtivos?.filter(
      (membro) => membro.categoria?.toLowerCase() === categoria
    ).length;

  const resumo = [
    { rotulo: "Membros ativos", valor: membrosAtivos?.length },
    { rotulo: "Desbravadores", valor: contarCategoria("aluno") },
    { rotulo: "Instrutores", valor: contarCategoria("instrutor") },
    { rotulo: "Classes", valor: dados?.totalClasses },
    { rotulo: "Especialidades", valor: dados?.totalEspecialidades },
  ];

  const eventos = useMemo(() => dados?.eventos ?? [], [dados]);

  const diasComEvento = useMemo(
    () => new Set(eventos.flatMap(diasDoEvento)),
    [eventos]
  );

  const chaveSelecionada = paraChaveData(dataSelecionada);
  const eventosDoDia = eventos.filter(
    (evento) =>
      evento.inicio <= chaveSelecionada && chaveSelecionada <= evento.fim
  );

  const proximosEventos = eventos
    .filter((evento) => evento.fim >= hojeChave)
    .sort((a, b) => a.inicio.localeCompare(b.inicio))
    .slice(0, LIMITE_PROXIMOS);

  const aniversariantes = useMemo(
    () =>
      (membrosAtivos ?? [])
        .filter((membro) => membro.dataNascimento)
        .map((membro) => ({ ...membro, nascimento: paraData(membro.dataNascimento) }))
        .filter(({ nascimento }) => nascimento.getMonth() === mesExibido.getMonth())
        .sort((a, b) => a.nascimento.getDate() - b.nascimento.getDate()),
    [membrosAtivos, mesExibido]
  );

  const repetido = Boolean(eventoAExcluir?.serie);

  const excluirEvento = async () => {
    const evento = eventoAExcluir;
    setEventoAExcluir(null);
    try {
      await deletarEvento(evento.id, escopoExclusao);
      await carregar();
    } catch (erroRequisicao) {
      setErroAgenda(
        erroRequisicao.response?.data?.erro ??
          "Não foi possível excluir o evento. Tente novamente."
      );
    }
  };

  const selecionarData = (data) => {
    setErroAgenda("");
    setDataSelecionada(data);
    setMesExibido(new Date(data.getFullYear(), data.getMonth(), 1));
  };

  const carregando = dados === null;
  const falhou =
    !carregando &&
    [dados.membros, dados.eventos, dados.totalClasses, dados.totalEspecialidades].some(
      (valor) => valor === null
    );

  return (
    <>
      <header className={detalhe.cabecalho}>
        <div className={detalhe.cabecalhoTextos}>
          <p className={detalhe.sobretitulo}>
            Clube Tamoios
            <span className={detalhe.matricula}>{formatoDia.format(agora)}</span>
          </p>
          <h1 className={detalhe.titulo}>
            {primeiroNome ? `Olá, ${primeiroNome}` : "Início"}
          </h1>
          <p className={detalhe.subtitulo}>
            Agenda, aniversariantes e números do clube.
          </p>
        </div>
      </header>

      {falhou && (
        <p className={styles.mensagemErro} role="alert">
          Parte dos dados não pôde ser carregada.
        </p>
      )}

      <section
        className={`${detalhe.blocoDados} ${desbravadores.resumo} ${styles.numeros}`}
        aria-label="Números do clube"
      >
        {resumo.map(({ rotulo, valor }) => (
          <div key={rotulo} className={detalhe.dado}>
            <span className={detalhe.dadoRotulo}>{rotulo}</span>
            <span className={desbravadores.resumoValor}>{valor ?? "—"}</span>
          </div>
        ))}
      </section>

      <div className={styles.grade}>
        <section className={detalhe.secao} aria-labelledby="titulo-agenda">
          <div className={`${detalhe.secaoCabecalho} ${styles.cabecalhoSecao}`}>
            <h2 id="titulo-agenda" className={detalhe.secaoTitulo}>
              Agenda
            </h2>
            <Button
              variante="destaque"
              compacto
              icone={<AddIcon fontSize="small" />}
              onClick={() => setFormulario({ evento: null })}
            >
              Adicionar evento
            </Button>
          </div>

          {erroAgenda && (
            <p className={styles.mensagemErro} role="alert">
              {erroAgenda}
            </p>
          )}

          <div className={styles.agenda}>
            <div className={styles.calendario}>
              <CalendarioAcademico
                mesExibido={mesExibido}
                dataSelecionada={dataSelecionada}
                onMudarMes={setMesExibido}
                onSelecionarData={selecionarData}
                marcados={diasComEvento}
                feriados={feriados}
              />
            </div>

            <div className={styles.diaSelecionado}>
              <h3 className={styles.tituloDia}>
                {formatoDia.format(dataSelecionada)}
              </h3>

              {feriados[chaveSelecionada] && (
                <div className={styles.feriadoDoDia}>
                  <SeloFeriado nome={feriados[chaveSelecionada]} grande />
                  <span className={styles.itemTextos}>
                    <span className={styles.itemTitulo}>{feriados[chaveSelecionada]}</span>
                    <span className={styles.itemDetalhe}>Feriado nacional</span>
                  </span>
                </div>
              )}

              {carregando ? (
                <Esqueleto linhas={2} rotulo="Carregando eventos" />
              ) : eventosDoDia.length > 0 ? (
                <ul className={styles.lista}>
                  {eventosDoDia.map((evento) => (
                    <li key={evento.id}>
                      <button
                        type="button"
                        className={styles.eventoDoDia}
                        onClick={() => setEventoAberto(evento)}
                      >
                        <span className={styles.itemTextos}>
                          <span className={styles.itemTitulo}>{evento.titulo}</span>
                          {periodo(evento) && (
                            <span className={styles.itemDetalhe}>{periodo(evento)}</span>
                          )}
                        </span>
                        <ChevronRightIcon fontSize="small" className={styles.seta} />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.vazio}>Nenhum evento neste dia.</p>
              )}
            </div>
          </div>
        </section>

        <div className={styles.coluna}>
          <section className={detalhe.secao} aria-labelledby="titulo-proximos">
            <div className={`${detalhe.secaoCabecalho} ${styles.cabecalhoSecao}`}>
              <h2 id="titulo-proximos" className={detalhe.secaoTitulo}>
                Próximos eventos
              </h2>
            </div>

            {carregando ? (
              <Esqueleto linhas={3} rotulo="Carregando próximos eventos" />
            ) : proximosEventos.length > 0 ? (
              <ul className={styles.lista}>
                {proximosEventos.map((evento) => {
                  const inicio = paraData(evento.inicio);
                  return (
                    <li key={evento.id}>
                      <button
                        type="button"
                        className={styles.item}
                        onClick={() => {
                          selecionarData(inicio);
                          setEventoAberto(evento);
                        }}
                      >
                        <span className={styles.selo}>
                          <span className={styles.seloDia}>{inicio.getDate()}</span>
                          <span className={styles.seloMes}>
                            {formatoMesCurto.format(inicio).replace(".", "")}
                          </span>
                        </span>
                        <span className={styles.itemTextos}>
                          <span className={styles.itemTitulo}>{evento.titulo}</span>
                          {periodo(evento) && (
                            <span className={styles.itemDetalhe}>{periodo(evento)}</span>
                          )}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className={styles.vazio}>Nenhum evento agendado.</p>
            )}
          </section>

          <section
            className={`${detalhe.secao} ${styles.secaoEsticada}`}
            aria-labelledby="titulo-aniversarios"
          >
            <div className={`${detalhe.secaoCabecalho} ${styles.cabecalhoSecao}`}>
              <h2 id="titulo-aniversarios" className={detalhe.secaoTitulo}>
                Aniversariantes de {formatoMes.format(mesExibido)}
              </h2>
              {!carregando && aniversariantes.length > 0 && (
                <span className={detalhe.secaoContagem}>
                  {aniversariantes.length}
                </span>
              )}
            </div>

            {carregando ? (
              <Esqueleto linhas={3} rotulo="Carregando aniversariantes" />
            ) : aniversariantes.length > 0 ? (
              <ul className={styles.lista}>
                {aniversariantes.map((membro) => {
                  const dia = membro.nascimento.getDate();
                  const idade =
                    mesExibido.getFullYear() - membro.nascimento.getFullYear();
                  const ehHoje =
                    dia === agora.getDate() &&
                    membro.nascimento.getMonth() === agora.getMonth();
                  return (
                    <li key={membro.id}>
                      <button
                        type="button"
                        className={styles.item}
                        onClick={() => navegar(`/dashboard/desbravadores/${membro.id}`)}
                      >
                        <Avatar nome={membro.nome} tamanho={36} />
                        <span className={styles.itemTextos}>
                          <span className={styles.itemTitulo}>{membro.nome}</span>
                          <span className={styles.itemDetalhe}>
                            {idade > 0 ? `Dia ${dia} · faz ${idade} anos` : `Dia ${dia}`}
                          </span>
                        </span>
                        {ehHoje && <span className={styles.tagHoje}>Hoje</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className={styles.vazio}>
                Ninguém faz aniversário em {formatoMes.format(mesExibido)}.
              </p>
            )}
          </section>
        </div>
      </div>

      {formulario && (
        <EventoFormModal
          evento={formulario.evento}
          dataInicial={dataSelecionada}
          onFechar={() => setFormulario(null)}
          onSalvar={async (dadosEvento, escopo) => {
            if (formulario.evento) {
              await atualizarEvento(formulario.evento.id, dadosEvento, escopo);
            } else {
              await criarEvento(dadosEvento);
            }
            await carregar();
            setFormulario(null);
          }}
        />
      )}

      {eventoAberto && (
        <EventoDetalheModal
          evento={eventoAberto}
          quando={intervalo(eventoAberto)}
          repeticao={resumoRepeticao(eventoAberto)}
          onFechar={() => setEventoAberto(null)}
          onEditar={() => {
            setEventoAberto(null);
            setFormulario({ evento: eventoAberto });
          }}
          onExcluir={() => {
            setEventoAberto(null);
            setErroAgenda("");
            setEscopoExclusao("ESTE");
            setEventoAExcluir(eventoAberto);
          }}
        />
      )}

      <ConfirmacaoModal
        aberto={Boolean(eventoAExcluir)}
        titulo={repetido ? "Excluir evento repetido?" : "Excluir evento?"}
        mensagem={
          eventoAExcluir &&
          (repetido
            ? `"${eventoAExcluir.titulo}" (${intervalo(eventoAExcluir)}) faz parte de uma série. Ocorrências com chamada registrada não são excluídas.`
            : `"${eventoAExcluir.titulo}" (${intervalo(eventoAExcluir)}) sai da agenda.`)
        }
        textoConfirmar="Excluir"
        perigo
        onConfirmar={excluirEvento}
        onCancelar={() => setEventoAExcluir(null)}
      >
        {repetido && (
          <EscolhaEscopo
            legenda="Excluir"
            valor={escopoExclusao}
            onChange={setEscopoExclusao}
          />
        )}
      </ConfirmacaoModal>
    </>
  );
}

export default Dashboard;
