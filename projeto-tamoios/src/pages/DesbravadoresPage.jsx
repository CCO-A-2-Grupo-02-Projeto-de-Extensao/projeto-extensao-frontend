import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import RestoreIcon from "@mui/icons-material/Restore";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { MemberFilters } from "../components/MemberFilters/MemberFilters.jsx";
import { MemberTable } from "../components/MemberTable/MemberTable.jsx";
import { Pagination } from "../components/Pagination/Pagination.jsx";
import { RemoverDesbravadorModal } from "../components/RemoverDesbravadorModal/RemoverDesbravadorModal.jsx";
import { ReativarDesbravadorModal } from "../components/ReativarDesbravadorModal/ReativarDesbravadorModal.jsx";
import {
  getMembros,
  CATEGORIAS,
  SITUACOES,
  desativarPessoa,
  reativarPessoa,
} from "../services/membrosService.js";
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
  const [membros, setMembros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const [ordenacao, setOrdenacao] = useState("az");
  const [categoria, setCategoria] = useState(CATEGORIAS.TODOS);
  const [situacao, setSituacao] = useState(SITUACOES.ATIVOS);
  const [busca, setBusca] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [modalRemoverAberto, setModalRemoverAberto] = useState(false);
  const [modalReativarAberto, setModalReativarAberto] = useState(false);

  const carregarMembros = () => {
    setCarregando(true);
    return getMembros()
      .then((dados) => {
        setMembros(dados);
        setErro(null);
      })
      .catch(() => {
        setErro("Não foi possível carregar os membros.");
      })
      .finally(() => {
        setCarregando(false);
      });
  };

  useEffect(() => {
    carregarMembros();
  }, []);

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
  }, []);

  const aoMudarSituacao = (valor) => {
    setSituacao(valor);
    setPaginaAtual(1);
  };

  const membrosAtivos = useMemo(
    () => membros.filter((membro) => membro.ativo),
    [membros]
  );

  const membrosInativos = useMemo(
    () => membros.filter((membro) => !membro.ativo),
    [membros]
  );

  const membrosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    // Parte de `membros` (todos), e não de `membrosAtivos`: quem decide se os
    // desativados entram é o filtro de situação. As listas `membrosAtivos` e
    // `membrosInativos` continuam servindo os modais de desativar/reativar em lote.
    return membros
      .filter((membro) => {
        if (situacao === SITUACOES.ATIVOS) return membro.ativo;
        if (situacao === SITUACOES.INATIVOS) return !membro.ativo;
        return true;
      })
      .filter((membro) => membro.nome.toLowerCase().includes(termo))
      .filter(
        (membro) =>
          categoria === CATEGORIAS.TODOS || membro.categoria === categoria
      )
      .sort((a, b) =>
        ordenacao === "az"
          ? a.nome.localeCompare(b.nome)
          : b.nome.localeCompare(a.nome)
      );
  }, [membros, busca, categoria, ordenacao, situacao]);

  const aoConfirmarDesativacao = async (selecionados) => {
    await Promise.all(selecionados.map((membro) => desativarPessoa(membro.id)));
    await carregarMembros();
  };

  const aoConfirmarReativacao = async (selecionados) => {
    await Promise.all(selecionados.map((membro) => reativarPessoa(membro.id)));
    await carregarMembros();
  };

  const aoSelecionarMembro = (membro) => {
    navegar(`/dashboard/desbravadores/${membro.id}`);
  };

  const totalPaginas = Math.max(
    1,
    Math.ceil(membrosFiltrados.length / TAMANHO_PAGINA)
  );

  const membrosDaPagina = useMemo(() => {
    const inicio = (paginaAtual - 1) * TAMANHO_PAGINA;
    return membrosFiltrados.slice(inicio, inicio + TAMANHO_PAGINA);
  }, [membrosFiltrados, paginaAtual]);

  const grupos = GRUPOS.filter(
    (grupo) => categoria === CATEGORIAS.TODOS || grupo.categoria === categoria
  ).map((grupo) => ({
    ...grupo,
    membros: membrosDaPagina.filter((m) => m.categoria === grupo.categoria),
  }));

  const resumo = [
    { rotulo: "Ativos", valor: membrosAtivos.length },
    { rotulo: "Desativados", valor: membrosInativos.length },
    ...GRUPOS.map((grupo) => ({
      rotulo: grupo.titulo,
      valor: membrosAtivos.filter((m) => m.categoria === grupo.categoria)
        .length,
    })),
  ];

  const nenhumEncontrado =
    !carregando && !erro && membrosFiltrados.length === 0;

  return (
    <>
      <header className={detalhe.cabecalho}>
        <button
          type="button"
          className={detalhe.botaoVoltar}
          onClick={() => navegar("/dashboard")}
          aria-label="Voltar para o início"
        >
          <ArrowBackIcon fontSize="small" />
        </button>

        <div className={detalhe.cabecalhoTextos}>
          <p className={detalhe.sobretitulo}>
            Clube Tamoios
            {!carregando && (
              <span className={detalhe.matricula}>
                {membros.length} membros cadastrados
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
            onClick={() => setModalReativarAberto(true)}
          >
            <RestoreIcon fontSize="small" />
            Reativar
          </button>
          <button
            type="button"
            className={detalhe.botaoDesativar}
            onClick={() => setModalRemoverAberto(true)}
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
              {membrosFiltrados.length}{" "}
              {membrosFiltrados.length === 1 ? "encontrado" : "encontrados"}
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

        {!carregando && !erro && membrosFiltrados.length > 0 && (
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
