import { useCallback, useEffect, useMemo, useState } from "react";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import PersonRemoveAlt1Icon from "@mui/icons-material/PersonRemoveAlt1";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CloseIcon from "@mui/icons-material/Close";

import { Select } from "../Select/Select.jsx";
import { Input } from "../Input/Input.jsx";
import { Button } from "../Button/Button.jsx";
import { Avatar } from "../Avatar/Avatar.jsx";
import { useFecharAoClicarFora } from "../../hooks/useFecharAoClicarFora.js";
import { normalizar } from "../../services/buscaGlobalService.js";

import {
  atualizarUnidade,
  criarUnidadeNaClasse,
  definirUnidadeDasPessoas,
  getParticipantesDaClasse,
} from "../../services/classesService.js";
import { getGeneros } from "../../services/catalogosService.js";
import {
  FAIXAS_ETARIAS,
  MAXIMO_DESBRAVADORES,
  MINIMO_DESBRAVADORES,
  cabeNaUnidade,
} from "../../utils/regrasUnidade.js";

import casca from "../../styles/cascaModal.module.css";
import styles from "../../styles/unidadeModal.module.css";

const FORM_VAZIO = {
  nome: "",
  idGenero: "",
  faixaEtaria: "",
  idConselheiro: "",
};

function mensagemDoErro(erroRequisicao, padrao) {
  const dados = erroRequisicao?.response?.data;
  return typeof dados?.erro === "string" ? dados.erro : padrao;
}

function formularioDaUnidade(unidade) {
  if (!unidade) return FORM_VAZIO;

  return {
    nome: unidade.nome ?? "",
    idGenero: unidade.idGenero ? String(unidade.idGenero) : "",
    faixaEtaria: unidade.faixaEtaria ?? "",
    idConselheiro: unidade.idConselheiro ? String(unidade.idConselheiro) : "",
  };
}

/**
 * Criar e editar unidade compartilham o mesmo modal. Em "criar" só há o
 * formulário; em "editar", à esquerda entram as duas listas — quem está na
 * unidade e quem pode entrar — e cada linha tem o próprio botão de entrar ou
 * sair, aplicado na hora. O botão do rodapé salva só os dados da unidade.
 *
 * Montado só enquanto aberto (o pai controla), então o estado inicial do
 * useState já basta — não há efeito de reset.
 */
export function UnidadeModal({
  modo,
  unidadeInicial,
  idClasse,
  nomeClasse,
  unidadesDaClasse = [],
  onFechar,
  onSalvo,
}) {
  const edicao = modo === "editar";
  // A unidade vem da linha em que o usuário clicou; o dropdown ainda permite
  // trocar sem fechar o modal.
  const unidadeDePartida = edicao
    ? unidadeInicial ?? unidadesDaClasse[0]
    : null;

  const [formulario, setFormulario] = useState(() =>
    formularioDaUnidade(unidadeDePartida)
  );
  const [idUnidadeSelecionada, setIdUnidadeSelecionada] = useState(
    unidadeDePartida ? String(unidadeDePartida.id) : ""
  );
  const [participantes, setParticipantes] = useState([]);
  const [generos, setGeneros] = useState([]);
  const [movendo, setMovendo] = useState(null);

  const [ordenacao, setOrdenacao] = useState("az");
  const [busca, setBusca] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const fecharAoClicarFora = useFecharAoClicarFora(onFechar);

  // O modal continua aberto depois de salvar, então a lista precisa ser
  // recarregável — não basta a carga inicial.
  const carregarParticipantes = useCallback(
    () =>
      getParticipantesDaClasse(idClasse)
        .then(setParticipantes)
        .catch(() => setErro("Não foi possível carregar os dados da classe.")),
    [idClasse]
  );

  useEffect(() => {
    carregarParticipantes();
    getGeneros()
      .then(setGeneros)
      .catch(() => setErro("Não foi possível carregar os dados da classe."));
  }, [carregarParticipantes]);

  // Trocar a unidade no dropdown é um evento, não sincronização de estado: o
  // formulário é reescrito aqui mesmo, sem efeito.
  const selecionarUnidade = (id) => {
    setIdUnidadeSelecionada(id);
    setErro("");
    setSucesso("");
    setFormulario(
      formularioDaUnidade(
        unidadesDaClasse.find((item) => String(item.id) === String(id))
      )
    );
  };

  const alterarCampo = (campo, valor) => {
    setSucesso("");
    setFormulario((atual) => ({ ...atual, [campo]: valor }));
  };

  const unidadeSelecionada = useMemo(
    () =>
      unidadesDaClasse.find(
        (item) => String(item.id) === String(idUnidadeSelecionada)
      ),
    [unidadesDaClasse, idUnidadeSelecionada]
  );

  const ocupacao = edicao
    ? unidadeSelecionada?.quantidadeDesbravadores ?? 0
    : 0;

  const vagas = Math.max(0, MAXIMO_DESBRAVADORES - ocupacao);

  const opcoesFaixaEtaria =
    formulario.faixaEtaria && !FAIXAS_ETARIAS.includes(formulario.faixaEtaria)
      ? [formulario.faixaEtaria, ...FAIXAS_ETARIAS]
      : FAIXAS_ETARIAS;

  const faltando = [
    !formulario.idGenero && "o sexo",
    !formulario.faixaEtaria && "a faixa etária",
  ].filter(Boolean);

  const desbravadoresVisiveis = useMemo(() => {
    const alvo = normalizar(busca);

    return participantes
      .filter((pessoa) => pessoa.categoria === "aluno")
      .filter((pessoa) => !alvo || normalizar(pessoa.nome).includes(alvo))
      .sort((a, b) =>
        ordenacao === "az"
          ? a.nome.localeCompare(b.nome)
          : b.nome.localeCompare(a.nome)
      );
  }, [participantes, busca, ordenacao]);

  const naUnidade = useMemo(
    () =>
      desbravadoresVisiveis.filter(
        (pessoa) => String(pessoa.idUnidade) === String(idUnidadeSelecionada)
      ),
    [desbravadoresVisiveis, idUnidadeSelecionada]
  );

  const disponiveis = useMemo(() => {
    if (!formulario.idGenero || !formulario.faixaEtaria) return [];

    return desbravadoresVisiveis.filter(
      (pessoa) =>
        String(pessoa.idUnidade) !== String(idUnidadeSelecionada) &&
        cabeNaUnidade(pessoa, formulario)
    );
  }, [desbravadoresVisiveis, idUnidadeSelecionada, formulario]);

  const foraDoPerfil = useMemo(
    () =>
      participantes.filter(
        (pessoa) =>
          pessoa.categoria === "aluno" &&
          String(pessoa.idUnidade) === String(idUnidadeSelecionada) &&
          !cabeNaUnidade(pessoa, formulario)
      ),
    [participantes, idUnidadeSelecionada, formulario]
  );

  const conselheirosPossiveis = useMemo(
    () => participantes.filter((pessoa) => pessoa.categoria !== "aluno"),
    [participantes]
  );

  const validar = useCallback(() => {
    if (!formulario.nome.trim()) return "Digite o nome da unidade.";
    if (!formulario.idGenero) return "Escolha o sexo da unidade.";
    if (!formulario.faixaEtaria) return "Escolha a faixa etária da unidade.";
    return "";
  }, [formulario]);

  const salvar = useCallback(async () => {
    const problema = validar();

    if (problema) {
      setErro(problema);
      return;
    }

    setSalvando(true);
    setErro("");
    setSucesso("");

    try {
      if (edicao) {
        await atualizarUnidade(Number(idUnidadeSelecionada), formulario);
        await onSalvo();
        setSucesso("Unidade salva.");
      } else {
        await criarUnidadeNaClasse(idClasse, formulario);
        await onSalvo();
        onFechar();
      }
    } catch (erroRequisicao) {
      setErro(
        mensagemDoErro(
          erroRequisicao,
          edicao
            ? "Não foi possível salvar a unidade."
            : "Não foi possível criar a unidade."
        )
      );
    } finally {
      setSalvando(false);
    }
  }, [
    validar,
    formulario,
    edicao,
    idUnidadeSelecionada,
    idClasse,
    onSalvo,
    onFechar,
  ]);

  // Entrar e sair são ações da linha, aplicadas na hora. A unidade é salva
  // junto porque o backend valida a pessoa contra o que está gravado — se o
  // formulário tivesse mudado sem salvar, a entrada seria recusada por um
  // motivo que não está mais na tela.
  const mover = useCallback(
    async (pessoa, entrando) => {
      const problema = validar();

      if (problema) {
        setErro(problema);
        return;
      }

      if (entrando && vagas <= 0) {
        setErro(
          `A unidade já tem ${ocupacao} desbravadores, o máximo é ${MAXIMO_DESBRAVADORES}.`
        );
        return;
      }

      setMovendo(pessoa.id);
      setErro("");
      setSucesso("");

      try {
        const idUnidade = Number(idUnidadeSelecionada);

        await atualizarUnidade(idUnidade, formulario);
        await definirUnidadeDasPessoas([pessoa.id], entrando ? idUnidade : null);
        await onSalvo();
        await carregarParticipantes();

        setSucesso(
          entrando
            ? `${pessoa.nome} entrou na unidade.`
            : `${pessoa.nome} saiu da unidade.`
        );
      } catch (erroRequisicao) {
        setErro(
          mensagemDoErro(
            erroRequisicao,
            `Não foi possível mover ${pessoa.nome}.`
          )
        );
      } finally {
        setMovendo(null);
      }
    },
    [
      validar,
      formulario,
      idUnidadeSelecionada,
      onSalvo,
      carregarParticipantes,
      vagas,
      ocupacao,
    ]
  );

  const linhaPessoa = (pessoa, entrando) => (
    <div key={pessoa.id} className={casca.linha}>
      <Avatar nome={pessoa.nome} tamanho={32} />
      <span className={casca.linhaTextos}>
        <span className={casca.linhaNome}>{pessoa.nome}</span>
        <span className={casca.linhaDetalhe}>
          {entrando
            ? pessoa.unidade || "Sem unidade"
            : pessoa.classe || "Sem classe"}
        </span>
      </span>

      {!entrando && foraDoPerfil.some((fora) => fora.id === pessoa.id) && (
        <span
          className={styles.linhaAlerta}
          title="Fora do sexo ou da faixa etária desta unidade"
        >
          <WarningAmberIcon sx={{ fontSize: 18 }} />
        </span>
      )}

      <Button
        variante="icone"
        className={styles.botaoLinha}
        onClick={() => mover(pessoa, entrando)}
        disabled={movendo !== null}
        aria-label={
          entrando
            ? `Adicionar ${pessoa.nome} à unidade`
            : `Remover ${pessoa.nome} da unidade`
        }
        title={entrando ? "Adicionar à unidade" : "Remover da unidade"}
      >
        {entrando ? (
          <PersonAddAlt1Icon sx={{ fontSize: 18 }} />
        ) : (
          <PersonRemoveAlt1Icon sx={{ fontSize: 18 }} />
        )}
      </Button>
    </div>
  );

  return (
    <div className={casca.overlay} {...fecharAoClicarFora}>
      <div
        className={`${casca.modal} ${edicao ? styles.modal : styles.modalSimples}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-unidade"
      >
        <div className={casca.cabecalho}>
          <div>
            <h2 id="titulo-unidade" className={casca.titulo}>
              {edicao ? "Editar unidade" : "Criar unidade"}
            </h2>
            {nomeClasse && (
              <span className={casca.subtitulo}>Classe {nomeClasse}</span>
            )}
          </div>
          <Button variante="fechar" onClick={onFechar} aria-label="Fechar">
            <CloseIcon />
          </Button>
        </div>

        <div className={casca.corpo}>
          {erro && <p className={casca.erro}>{erro}</p>}
          {sucesso && <p className={casca.sucesso}>{sucesso}</p>}

          <div className={edicao ? styles.campos : styles.camposSimples}>
            {edicao ? (
              <label className={styles.campo}>
                Unidade selecionada
                <Select
                  value={idUnidadeSelecionada}
                  onChange={(e) => selecionarUnidade(e.target.value)}
                >
                  {unidadesDaClasse.map((unidade) => (
                    <option key={unidade.id} value={unidade.id}>
                      {unidade.nome}
                    </option>
                  ))}
                </Select>
              </label>
            ) : (
              <label className={styles.campo}>
                Nome da unidade
                <Input
                  type="text"
                  placeholder="Nome da unidade"
                  value={formulario.nome}
                  onChange={(e) => alterarCampo("nome", e.target.value)}
                />
              </label>
            )}

            <label className={styles.campo}>
              Sexo
              <Select
                value={formulario.idGenero}
                onChange={(e) => alterarCampo("idGenero", e.target.value)}
              >
                <option value="">Selecione</option>
                {generos.map((genero) => (
                  <option key={genero.id} value={genero.id}>
                    {genero.nome}
                  </option>
                ))}
              </Select>
            </label>

            <label className={styles.campo}>
              Faixa etária
              <Select
                value={formulario.faixaEtaria}
                onChange={(e) => alterarCampo("faixaEtaria", e.target.value)}
              >
                <option value="">Selecione</option>
                {opcoesFaixaEtaria.map((faixa) => (
                  <option key={faixa} value={faixa}>
                    {faixa} anos
                  </option>
                ))}
              </Select>
            </label>

            <label className={styles.campo}>
              Conselheiro da unidade
              <Select
                value={formulario.idConselheiro}
                onChange={(e) => alterarCampo("idConselheiro", e.target.value)}
              >
                <option value="">Selecione</option>
                {conselheirosPossiveis.map((pessoa) => (
                  <option key={pessoa.id} value={pessoa.id}>
                    {pessoa.nome}
                  </option>
                ))}
              </Select>
            </label>
          </div>

          {edicao && foraDoPerfil.length > 0 && (
            <div className={casca.alerta}>
              <WarningAmberIcon fontSize="small" />
              <span>
                Fora do perfil desta unidade:{" "}
                {foraDoPerfil.map((pessoa) => pessoa.nome).join(", ")}. Ajuste o
                sexo ou a faixa etária, ou remova essas pessoas da unidade.
              </span>
            </div>
          )}

          {edicao && (
            <>
              <div className={casca.filtros}>
                <div className={casca.campoOrdenacao}>
                  <Select
                    value={ordenacao}
                    onChange={(e) => setOrdenacao(e.target.value)}
                    aria-label="Ordenação"
                  >
                    <option value="az">A-Z</option>
                    <option value="za">Z-A</option>
                  </Select>
                </div>
                <div className={casca.campoBusca}>
                  <Input
                    type="search"
                    placeholder="Buscar por nome"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    aria-label="Buscar desbravador por nome"
                  />
                </div>
              </div>

              <div className={styles.listas}>
                <section className={styles.grupoLista}>
                  <h3 className={casca.secaoTitulo}>
                    Nesta unidade ({naUnidade.length})
                  </h3>
                  <div className={casca.lista}>
                    {naUnidade.length === 0 && (
                      <p className={casca.vazio}>
                        Nenhum desbravador nesta unidade ainda.
                      </p>
                    )}
                    {naUnidade.map((pessoa) => linhaPessoa(pessoa, false))}
                  </div>
                </section>

                <section className={styles.grupoLista}>
                  <h3 className={casca.secaoTitulo}>
                    Disponíveis para entrar ({disponiveis.length})
                  </h3>
                  <div className={casca.lista}>
                    {disponiveis.length === 0 && (
                      <p className={casca.vazio}>
                        {faltando.length > 0
                          ? `Selecione ${faltando.join(" e ")} da unidade para ver os desbravadores.`
                          : "Nenhum desbravador da classe cabe no perfil desta unidade."}
                      </p>
                    )}
                    {disponiveis.map((pessoa) => linhaPessoa(pessoa, true))}
                  </div>
                </section>
              </div>
            </>
          )}
        </div>

        <div className={casca.rodape}>
          {edicao && (
            <span className={casca.resumo}>
              {ocupacao} de {MAXIMO_DESBRAVADORES} desbravadores
              {ocupacao < MINIMO_DESBRAVADORES
                ? ` — a unidade deve ter ao menos ${MINIMO_DESBRAVADORES}`
                : ""}
            </span>
          )}

          <div className={casca.botoes}>
            <Button
              variante="secundario"
              onClick={onFechar}
              texto={edicao ? "Fechar" : "Cancelar"}
            />
            <Button
              onClick={salvar}
              disabled={salvando || movendo !== null}
              texto={
                salvando
                  ? edicao
                    ? "Salvando..."
                    : "Criando..."
                  : edicao
                    ? "Salvar unidade"
                    : "Criar unidade"
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default UnidadeModal;
