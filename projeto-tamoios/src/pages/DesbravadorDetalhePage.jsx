import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonIcon from "@mui/icons-material/Person";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import CallIcon from "@mui/icons-material/Call";
import ChatIcon from "@mui/icons-material/Chat";
import SchoolIcon from "@mui/icons-material/School";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import EditIcon from "@mui/icons-material/Edit";

import { DashboardLayout } from "../layout/DashboardLayout.jsx";
import { ConfirmacaoModal } from "../components/ConfirmacaoModal/ConfirmacaoModal.jsx";
import { EditarDesbravadorModal } from "../components/EditarDesbravadorModal/EditarDesbravadorModal.jsx";
import { HistoricoEscolarModal } from "../components/HistoricoEscolarModal/HistoricoEscolarModal.jsx";
import { DesempenhoClubeModal } from "../components/DesempenhoClubeModal/DesempenhoClubeModal.jsx";

import {
  getMembro,
  desativarPessoa,
  reativarPessoa,
} from "../services/membrosService.js";
import { listarDocumentosDaPessoa } from "../services/documentosService.js";
import { DOCUMENTOS, MAX_RESPONSAVEIS } from "../utils/desbravadorForm.jsx";

import styles from "../styles/desbravadorDetalhePage.module.css";

function formatarData(valor) {
  if (!valor) return null;
  const data = new Date(`${valor}T00:00:00`);
  if (Number.isNaN(data.getTime())) return valor;
  return data.toLocaleDateString("pt-BR");
}

function calcularIdade(valor) {
  if (!valor) return null;
  const nascimento = new Date(`${valor}T00:00:00`);
  if (Number.isNaN(nascimento.getTime())) return null;
  const hoje = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mes = hoje.getMonth() - nascimento.getMonth();
  if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) idade -= 1;
  return idade;
}

// Mantém só os dígitos para montar os links tel: e wa.me (o telefone é
// guardado já mascarado, no formato (00) 00000-0000).
function apenasDigitos(telefone) {
  return String(telefone ?? "").replace(/\D/g, "");
}

function Dado({ rotulo, valor }) {
  return (
    <div className={styles.dado}>
      <span className={styles.dadoRotulo}>{rotulo}</span>
      {valor ? (
        <span className={styles.dadoValor}>{valor}</span>
      ) : (
        <span className={styles.dadoVazio}>Não informado</span>
      )}
    </div>
  );
}

function CartaoResponsavel({ numero, responsavel }) {
  const digitos = apenasDigitos(responsavel.telefone);

  return (
    <article className={styles.responsavel}>
      <h3 className={styles.responsavelTitulo}>Responsável {numero}</h3>
      <p className={styles.responsavelNome}>
        {responsavel.nome || <span className={styles.dadoVazio}>Sem nome</span>}
      </p>

      {responsavel.telefone && (
        <p className={styles.responsavelTelefone}>
          <CallIcon fontSize="small" />
          {responsavel.telefone}
        </p>
      )}

      <dl className={styles.responsavelLinhas}>
        <div className={styles.responsavelLinha}>
          <dt>RG</dt>
          <dd>{responsavel.rg || "—"}</dd>
        </div>
        <div className={styles.responsavelLinha}>
          <dt>CPF</dt>
          <dd>{responsavel.cpf || "—"}</dd>
        </div>
      </dl>

      {digitos && (
        <div className={styles.responsavelAcoes}>
          <a className={styles.botaoContato} href={`tel:+55${digitos}`}>
            <CallIcon fontSize="small" />
            Ligar
          </a>
          <a
            className={styles.botaoContato}
            href={`https://wa.me/55${digitos}`}
            target="_blank"
            rel="noreferrer"
          >
            <ChatIcon fontSize="small" />
            WhatsApp
          </a>
        </div>
      )}
    </article>
  );
}

function ConteudoDesbravador({ idPessoa }) {
  const navegar = useNavigate();

  const [membro, setMembro] = useState(null);
  const [documentos, setDocumentos] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [confirmacaoAberta, setConfirmacaoAberta] = useState(false);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [modalHistoricoAberto, setModalHistoricoAberto] = useState(false);
  const [modalDesempenhoAberto, setModalDesempenhoAberto] = useState(false);

  useEffect(() => {
    let ativo = true;

    getMembro(idPessoa)
      .then((dados) => {
        if (!ativo) return;
        setMembro(dados);
        setCarregando(false);
        return listarDocumentosDaPessoa(dados.id);
      })
      .then((docs) => {
        if (ativo && docs) setDocumentos(docs);
      })
      .catch(() => {
        if (!ativo) return;
        setErro("Não foi possível carregar os dados deste desbravador.");
        setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [idPessoa]);

  const aoAlterarStatus = async () => {
    if (membro.ativo) {
      setConfirmacaoAberta(true);
      return;
    }
    await reativarPessoa(membro.id);
    setMembro({ ...membro, ativo: true });
  };

  const confirmarDesativacao = async () => {
    await desativarPessoa(membro.id);
    setConfirmacaoAberta(false);
    setMembro({ ...membro, ativo: false });
  };

  if (carregando) {
    return (
      <DashboardLayout>
        <p className={styles.mensagem}>Carregando...</p>
      </DashboardLayout>
    );
  }

  if (erro || !membro) {
    return (
      <DashboardLayout>
        <p className={styles.mensagemErro}>{erro || "Desbravador não encontrado."}</p>
        <button type="button" className={styles.botaoVoltar} onClick={() => navegar(-1)}>
          <ArrowBackIcon fontSize="small" />
          Voltar
        </button>
      </DashboardLayout>
    );
  }

  const idade = calcularIdade(membro.dataNascimento);
  const telefoneDigitos = apenasDigitos(membro.telefone);

  const responsaveis = Array.from({ length: MAX_RESPONSAVEIS }, (_, indice) => ({
    nome: membro[`nomeResponsavel${indice + 1}`],
    telefone: membro[`telefoneResponsavel${indice + 1}`],
    rg: membro[`rgResponsavel${indice + 1}`],
    cpf: membro[`cpfResponsavel${indice + 1}`],
  })).filter(({ nome, telefone, rg, cpf }) => nome || telefone || rg || cpf);

  const enviados = DOCUMENTOS.filter((documento) => documentos[documento.id]).length;
  const percentual = Math.round((enviados / DOCUMENTOS.length) * 100);

  return (
    <DashboardLayout>
      <header className={styles.cabecalho}>
        <button
          type="button"
          className={styles.botaoVoltar}
          onClick={() => navegar("/dashboard/desbravadores")}
          aria-label="Voltar para a lista de desbravadores"
        >
          <ArrowBackIcon fontSize="small" />
        </button>

        <div className={styles.cabecalhoTextos}>
          <p className={styles.sobretitulo}>
            {membro.unidade || "Sem unidade"}
            {membro.classe ? ` • ${membro.classe}` : ""}
            <span className={styles.matricula}>Matrícula #{membro.id}</span>
          </p>
          <h1 className={styles.titulo}>Informações do Desbravador</h1>
          <p className={styles.subtitulo}>
            Dados cadastrais, responsáveis e acervo de documentação.
          </p>
        </div>

        <div className={styles.cabecalhoAcoes}>
          <button
            type="button"
            className={membro.ativo ? styles.botaoDesativar : styles.botaoReativar}
            onClick={aoAlterarStatus}
          >
            {membro.ativo ? "Desativar" : "Reativar"}
          </button>
          <button
            type="button"
            className={styles.botaoPrimario}
            onClick={() => setModalEditarAberto(true)}
          >
            <EditIcon fontSize="small" />
            Editar Informações
          </button>
        </div>
      </header>

      <div className={styles.painel}>
        <div className={styles.coluna}>
          <section className={styles.perfil}>
            <div className={styles.avatar}>
              <PersonIcon className={styles.avatarIcone} />
            </div>

            <div className={styles.perfilTextos}>
              <div className={styles.perfilBadges}>
                <span className={styles.tagPapel}>{membro.papel || "Sem cargo"}</span>
                <span
                  className={`${styles.tagStatus} ${
                    membro.ativo ? styles.tagStatusAtivo : styles.tagStatusInativo
                  }`}
                >
                  {membro.ativo ? "Ativo" : "Inativo"}
                </span>
              </div>
              <h2 className={styles.perfilNome}>{membro.nome}</h2>
              <div className={styles.perfilLinha}>
                <Dado
                  rotulo="Nascimento"
                  valor={
                    membro.dataNascimento
                      ? `${formatarData(membro.dataNascimento)}${
                          idade !== null ? ` (${idade} anos)` : ""
                        }`
                      : null
                  }
                />
                <Dado rotulo="Gênero" valor={membro.genero} />
              </div>
            </div>
          </section>

          <section className={styles.blocoDados}>
            <Dado rotulo="Cargo" valor={membro.papel} />
            <Dado rotulo="Unidade" valor={membro.unidade} />
            <Dado rotulo="Classe" valor={membro.classe} />
            <Dado
              rotulo="Telefone"
              valor={
                membro.telefone && telefoneDigitos ? (
                  <a className={styles.link} href={`tel:+55${telefoneDigitos}`}>
                    {membro.telefone}
                  </a>
                ) : (
                  membro.telefone
                )
              }
            />
            <Dado rotulo="CPF" valor={membro.cpf} />
            <Dado rotulo="RG" valor={membro.rg} />
            <Dado rotulo="Escola" valor={membro.escola} />
            <Dado rotulo="Turma" valor={membro.turma} />
          </section>

          <section className={styles.secao}>
            <div className={styles.secaoCabecalho}>
              <h2 className={styles.secaoTitulo}>Responsáveis</h2>
              <span className={styles.secaoContagem}>
                {responsaveis.length === 1
                  ? "1 contato cadastrado"
                  : `${responsaveis.length} contatos cadastrados`}
              </span>
            </div>

            {responsaveis.length === 0 ? (
              <p className={styles.mensagemVazia}>Nenhum responsável cadastrado.</p>
            ) : (
              <div className={styles.responsaveis}>
                {responsaveis.map((responsavel, indice) => (
                  <CartaoResponsavel
                    key={indice}
                    numero={indice + 1}
                    responsavel={responsavel}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className={styles.colunaLateral}>
          <section className={styles.documentos}>
            <div className={styles.documentosCabecalho}>
              <div>
                <h2 className={styles.secaoTitulo}>Dados digitalizados</h2>
                <p className={styles.percentual}>{percentual}%</p>
              </div>
              <span className={styles.documentosContagem}>
                {enviados} de {DOCUMENTOS.length} anexados
              </span>
            </div>

            <div
              className={styles.barra}
              role="progressbar"
              aria-valuenow={percentual}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Documentação digitalizada"
            >
              <div className={styles.barraPreenchida} style={{ width: `${percentual}%` }} />
            </div>

            <ul className={styles.documentosGrade}>
              {DOCUMENTOS.map((documento) => {
                const enviado = Boolean(documentos[documento.id]);
                return (
                  <li
                    key={documento.id}
                    className={`${styles.documento} ${enviado ? styles.documentoEnviado : ""}`}
                  >
                    {enviado ? (
                      <CheckCircleIcon className={styles.documentoIconeOk} fontSize="small" />
                    ) : (
                      <RadioButtonUncheckedIcon
                        className={styles.documentoIconePendente}
                        fontSize="small"
                      />
                    )}
                    <span className={styles.documentoTitulo}>{documento.titulo}</span>
                    <span
                      className={
                        enviado ? styles.documentoStatusOk : styles.documentoStatusPendente
                      }
                    >
                      {enviado ? "Anexado" : "Pendente"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>

          <div className={styles.atalhos}>
            <button
              type="button"
              className={styles.atalho}
              onClick={() => setModalHistoricoAberto(true)}
            >
              <SchoolIcon className={styles.atalhoIcone} />
              <span className={styles.atalhoTexto}>
                <strong>Histórico Escolar</strong>
                <small>Notas e série por ano</small>
              </span>
              <ChevronRightIcon className={styles.atalhoSeta} />
            </button>

            <button
              type="button"
              className={styles.atalho}
              onClick={() => setModalDesempenhoAberto(true)}
            >
              <MilitaryTechIcon className={styles.atalhoIcone} />
              <span className={styles.atalhoTexto}>
                <strong>Desempenho no Clube</strong>
                <small>Especialidades e requisitos</small>
              </span>
              <ChevronRightIcon className={styles.atalhoSeta} />
            </button>
          </div>
        </aside>
      </div>

      <EditarDesbravadorModal
        aberto={modalEditarAberto}
        membro={membro}
        onFechar={() => setModalEditarAberto(false)}
        onSalvar={(atualizado) => {
          setMembro(atualizado ?? membro);
          setModalEditarAberto(false);
        }}
      />

      <HistoricoEscolarModal
        aberto={modalHistoricoAberto}
        membro={membro}
        onFechar={() => setModalHistoricoAberto(false)}
      />

      <DesempenhoClubeModal
        aberto={modalDesempenhoAberto}
        membro={membro}
        onFechar={() => setModalDesempenhoAberto(false)}
        onSalvar={() => setModalDesempenhoAberto(false)}
      />

      <ConfirmacaoModal
        aberto={confirmacaoAberta}
        titulo="Desativar desbravador"
        mensagem={`${membro.nome} deixará de aparecer nas listagens e chamadas do clube. É possível reativar depois.`}
        textoConfirmar="Desativar"
        perigo
        onConfirmar={confirmarDesativacao}
        onCancelar={() => setConfirmacaoAberta(false)}
      />
    </DashboardLayout>
  );
}

// A key força a remontagem ao navegar de um desbravador para outro, o que
// devolve o estado inicial (carregando) sem precisar resetá-lo no efeito.
export function DesbravadorDetalhePage() {
  const { idPessoa } = useParams();
  return <ConteudoDesbravador key={idPessoa} idPessoa={idPessoa} />;
}

export default DesbravadorDetalhePage;
