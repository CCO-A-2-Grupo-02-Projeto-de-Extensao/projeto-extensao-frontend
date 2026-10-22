import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEstadoDaTela } from "../hooks/useEstadoDaTela.js";
import { useVoltar } from "../hooks/useVoltar.js";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import RestoreIcon from "@mui/icons-material/Restore";
import { Tooltip } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { MemberFilters } from "../components/MemberFilters/MemberFilters.jsx";
import { MemberTable } from "../components/MemberTable/MemberTable.jsx";
import { Pagination } from "../components/Pagination/Pagination.jsx";
import { RemoverDesbravadorModal } from "../components/RemoverDesbravadorModal/RemoverDesbravadorModal.jsx";
import { ReativarDesbravadorModal } from "../components/ReativarDesbravadorModal/ReativarDesbravadorModal.jsx";
import {
  getMembros,
  getMembrosPaginados,
  getResumoMembros,
  CATEGORIAS,
  CLASSES_TODAS,
  SITUACOES,
  desativarPessoa,
  reativarPessoa,
} from "../services/membrosService.js";
import { useCatalogos } from "../hooks/useCatalogos.js";
import detalhe from "../styles/desbravadorDetalhePage.module.css";
import styles from "../styles/desbravadoresPage.module.css";
import { Esqueleto } from "../components/Esqueleto/Esqueleto.jsx";

const TAMANHO_PAGINA = 10;

const GRUPOS = [
  { categoria: CATEGORIAS.ADMINISTRATIVO, titulo: "Administrativo" },
  { categoria: CATEGORIAS.INSTRUTOR, titulo: "Instrutores" },
  { categoria: CATEGORIAS.ALUNO, titulo: "Alunos" },
];

export function DesbravadoresPage() {
  const navegar = useNavigate();
  const voltar = useVoltar("/dashboard");
  const { classes } = useCatalogos();
  const [pagina, setPagina] = useState(null);
  const [resumoMembros, setResumoMembros] = useState(null);
  const [todosMembros, setTodosMembros] = useState([]);
  const [versao, setVersao] = useState(0);
  const [erro, setErro] = useState(null);

  const [ordenacao, setOrdenacao] = useEstadoDaTela("ordenacao", "az");
  const [categoria, setCategoria] = useEstadoDaTela("categoria", CATEGORIAS.TODOS);
  const [situacao, setSituacao] = useEstadoDaTela("situacao", SITUACOES.ATIVOS);
  const [classe, setClasse] = useEstadoDaTela("classe", CLASSES_TODAS);
  const [busca, setBusca] = useEstadoDaTela("busca", "");
  const [paginaAtual, setPaginaAtual] = useEstadoDaTela("paginaAtual", 1);
  const [modalRemoverAberto, setModalRemoverAberto] = useState(false);
  const [modalReativarAberto, setModalReativarAberto] = useState(false);

  useEffect(() => {
    let atual = true;

    getMembrosPaginados({
      pagina: paginaAtual,
      tamanho: TAMANHO_PAGINA,
      busca,
      situacao,
      categoria,
      classe,
      ordenacao,
    })
      .then((dados) => {
        if (!atual) return;
        if (dados.totalPaginas > 0 && paginaAtual > dados.totalPaginas) {
          setPaginaAtual(dados.totalPaginas);
          return;
        }
        setPagina(dados);
        setErro(null);
      })
      .catch(() => {
        if (atual) setErro("Não foi possível carregar os membros.");
      });

    return () => {
      atual = false;
    };
  }, [paginaAtual, busca, situacao, categoria, classe, ordenacao, versao, setPaginaAtual]);

  useEffect(() => {
    getResumoMembros()
      .then(setResumoMembros)
      .catch(() => setErro("Não foi possível carregar os membros."));
  }, [versao]);

  const recarregar = () => setVersao((valor) => valor + 1);

  const abrirModal = (abrir) => {
    getMembros()
      .then(setTodosMembros)
      .catch(() => setErro("Não foi possível carregar os membros."));
    abrir(true);
  };

  const aoMudarOrdenacao = (valor) => {
    setOrdenacao(valor);
    setPaginaAtual(1);
  };

  const aoMudarCategoria = (valor) => {
    setCategoria(valor);
    setPaginaAtual(1);
  };

  const aoMudarBusca = useCallback((valor) => {
    setBusca(valor);
    setPaginaAtual(1);
  }, [setBusca, setPaginaAtual]);

  const aoMudarSituacao = (valor) => {
    setSituacao(valor);
    setPaginaAtual(1);
  };

  const aoMudarClasse = (valor) => {
    setClasse(valor);
    setPaginaAtual(1);
  };

  const membrosAtivos = useMemo(
    () => todosMembros.filter((membro) => membro.ativo),
    [todosMembros]
  );

  const membrosInativos = useMemo(
    () => todosMembros.filter((membro) => !membro.ativo),
    [todosMembros]
  );

  const aoConfirmarDesativacao = async (selecionados) => {
    await Promise.all(selecionados.map((membro) => desativarPessoa(membro.id)));
    recarregar();
  };

  const aoConfirmarReativacao = async (selecionados) => {
    await Promise.all(selecionados.map((membro) => reativarPessoa(membro.id)));
    recarregar();
  };

  const aoSelecionarMembro = (membro) => {
    navegar(`/dashboard/desbravadores/${membro.id}`);
  };

  const carregando = !erro && (pagina === null || resumoMembros === null);
  const membrosDaPagina = pagina?.membros ?? [];
  const totalFiltrado = pagina?.total ?? 0;
  const totalPaginas = Math.max(1, pagina?.totalPaginas ?? 1);

  const grupos = GRUPOS.filter(
    (grupo) => categoria === CATEGORIAS.TODOS || grupo.categoria === categoria
  ).map((grupo) => ({
    ...grupo,
    membros: membrosDaPagina.filter((m) => m.categoria === grupo.categoria),
  }));

  const resumo = [
    { rotulo: "Ativos", valor: resumoMembros?.ativos },
    { rotulo: "Desativados", valor: resumoMembros?.inativos },
    { rotulo: "Administrativo", valor: resumoMembros?.administrativos },
    { rotulo: "Instrutores", valor: resumoMembros?.instrutores },
    { rotulo: "Alunos", valor: resumoMembros?.alunos },
  ];

  const nenhumEncontrado = !carregando && !erro && totalFiltrado === 0;

  return (
    <>
      <header className={detalhe.cabecalho}>
        <Tooltip arrow placement="bottom" title="Voltar para a tela anterior">
          <button
            type="button"
            className={detalhe.botaoVoltar}
            onClick={voltar}
          >
            <ArrowBackIcon fontSize="small" />
          </button>
        </Tooltip>

        <div className={detalhe.cabecalhoTextos}>
          <p className={detalhe.sobretitulo}>
            Clube Tamoios
            {!carregando && (
              <span className={detalhe.matricula}>
                {resumoMembros.total} membros cadastrados
              </span>
            )}
          </p>
          <h1 className={detalhe.titulo}>Desbravadores</h1>
          <p className={detalhe.subtitulo}>
            Membros do clube, situação e documentação de cada um.
          </p>
        </div>

        <div className={detalhe.cabecalhoAcoes}>
          <button
            type="button"
            className={detalhe.botaoSecundario}
            onClick={() => abrirModal(setModalReativarAberto)}
          >
            <RestoreIcon fontSize="small" />
            Reativar
          </button>
          <button
            type="button"
            className={detalhe.botaoDesativar}
            onClick={() => abrirModal(setModalRemoverAberto)}
          >
            <PersonOffIcon fontSize="small" />
            Desativar
          </button>
          <button
            type="button"
            className={detalhe.botaoPrimario}
            onClick={() => navegar("/dashboard/desbravadores/novo")}
          >
            <PersonAddIcon fontSize="small" />
            Cadastrar desbravador
          </button>
        </div>
      </header>

      <section className={`${detalhe.blocoDados} ${styles.resumo}`}>
        {resumo.map(({ rotulo, valor }) => (
          <div key={rotulo} className={detalhe.dado}>
            <span className={detalhe.dadoRotulo}>{rotulo}</span>
            <span className={styles.resumoValor}>
              {carregando ? "—" : valor}
            </span>
          </div>
        ))}
      </section>

      <section className={`${detalhe.secao} ${styles.membros}`}>
        <div className={detalhe.secaoCabecalho}>
          <h2 className={detalhe.secaoTitulo}>Membros</h2>
          {!carregando && !erro && (
            <span className={detalhe.secaoContagem}>
              {totalFiltrado}{" "}
              {totalFiltrado === 1 ? "encontrado" : "encontrados"}
            </span>
          )}
        </div>

        <MemberFilters
          ordenacao={ordenacao}
          onOrdenacaoChange={aoMudarOrdenacao}
          categoria={categoria}
          onCategoriaChange={aoMudarCategoria}
          situacao={situacao}
          onSituacaoChange={aoMudarSituacao}
          classe={classe}
          onClasseChange={aoMudarClasse}
          classes={classes}
          busca={busca}
          onBuscaChange={aoMudarBusca}
        />

        {carregando && <Esqueleto linhas={8} rotulo="Carregando membros" />}

        {!carregando && erro && <p className={styles.mensagemEstado}>{erro}</p>}

        {nenhumEncontrado && (
          <p className={styles.mensagemEstado}>Nenhum membro encontrado.</p>
        )}

        {!carregando &&
          !erro &&
          grupos.map(
            (grupo) =>
              grupo.membros.length > 0 && (
                <MemberTable
                  key={grupo.categoria}
                  titulo={grupo.titulo}
                  membros={grupo.membros}
                  onSelecionarMembro={aoSelecionarMembro}
                />
              )
          )}

        {!carregando && !erro && totalFiltrado > 0 && (
          <Pagination
            paginaAtual={paginaAtual}
            totalPaginas={totalPaginas}
            onPaginaChange={setPaginaAtual}
          />
        )}
      </section>

      <RemoverDesbravadorModal
        aberto={modalRemoverAberto}
        membros={membrosAtivos}
        onFechar={() => setModalRemoverAberto(false)}
        onConfirmar={aoConfirmarDesativacao}
      />

      <ReativarDesbravadorModal
        aberto={modalReativarAberto}
        membros={membrosInativos}
        onFechar={() => setModalReativarAberto(false)}
        onConfirmar={aoConfirmarReativacao}
      />
    </>
  );
}

export default DesbravadoresPage;
