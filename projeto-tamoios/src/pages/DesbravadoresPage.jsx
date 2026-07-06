import { useEffect, useMemo, useState } from "react";
import { CircularProgress } from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import RestoreIcon from "@mui/icons-material/Restore";
import { DashboardLayout } from "../layout/DashboardLayout.jsx";
import { NomePagina } from "../components/NomePagina/NomePagina.jsx";
import { ActionButton } from "../components/ActionButton/ActionButton.jsx";
import { MemberFilters } from "../components/MemberFilters/MemberFilters.jsx";
import { MemberTable } from "../components/MemberTable/MemberTable.jsx";
import { Pagination } from "../components/Pagination/Pagination.jsx";
import { RemoverDesbravadorModal } from "../components/RemoverDesbravadorModal/RemoverDesbravadorModal.jsx";
import { ReativarDesbravadorModal } from "../components/ReativarDesbravadorModal/ReativarDesbravadorModal.jsx";
import { CadastroDesbravadorModal } from "../components/CadastroDesbravadorModal/CadastroDesbravadorModal.jsx";
import { getMembros, CATEGORIAS } from "../services/membrosService.js";
import styles from "../styles/desbravadoresPage.module.css";

const TAMANHO_PAGINA = 10;

const GRUPOS = [
  { categoria: CATEGORIAS.ADMINISTRATIVO, titulo: "Administrativo" },
  { categoria: CATEGORIAS.INSTRUTOR, titulo: "Instrutores" },
  { categoria: CATEGORIAS.ALUNO, titulo: "Alunos" },
];

export function DesbravadoresPage() {
  const [membros, setMembros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const [ordenacao, setOrdenacao] = useState("az");
  const [categoria, setCategoria] = useState(CATEGORIAS.TODOS);
  const [busca, setBusca] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [modalRemoverAberto, setModalRemoverAberto] = useState(false);
  const [modalReativarAberto, setModalReativarAberto] = useState(false);
  const [modalCadastroAberto, setModalCadastroAberto] = useState(false);

  useEffect(() => {
    let ativo = true;

    getMembros()
      .then((dados) => {
        if (ativo) setMembros(dados);
      })
      .catch(() => {
        if (ativo) setErro("Não foi possível carregar os membros.");
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  const aoMudarOrdenacao = (valor) => {
    setOrdenacao(valor);
    setPaginaAtual(1);
  };

  const aoMudarCategoria = (valor) => {
    setCategoria(valor);
    setPaginaAtual(1);
  };

  const aoMudarBusca = (valor) => {
    setBusca(valor);
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

    return membrosAtivos
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
  }, [membrosAtivos, busca, categoria, ordenacao]);

  const aoConfirmarDesativacao = (selecionados) => {
    const idsSelecionados = new Set(selecionados.map((membro) => membro.id));
    setMembros((atual) =>
      atual.map((membro) =>
        idsSelecionados.has(membro.id) ? { ...membro, ativo: false } : membro
      )
    );
  };

  const aoConfirmarReativacao = (selecionados) => {
    const idsSelecionados = new Set(selecionados.map((membro) => membro.id));
    setMembros((atual) =>
      atual.map((membro) =>
        idsSelecionados.has(membro.id) ? { ...membro, ativo: true } : membro
      )
    );
  };

  const aoCadastrarMembro = (novoMembro) => {
    setMembros((atual) => {
      const proximoId = Math.max(0, ...atual.map((m) => m.id)) + 1;
      return [...atual, { id: proximoId, ...novoMembro }];
    });
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

  const nenhumEncontrado =
    !carregando && !erro && membrosFiltrados.length === 0;

  return (
    <DashboardLayout>
      <NomePagina
        titulo="Desbravadores"
        subtitulo="Resumo dos membros do clube"
      />

      <div className={styles.acoes}>
        <ActionButton
          icon={<PersonAddIcon />}
          texto="Cadastrar desbravadores"
          onClick={() => setModalCadastroAberto(true)}
        />
        <ActionButton
          icon={<PersonOffIcon />}
          texto="Desativar desbravadores"
          onClick={() => setModalRemoverAberto(true)}
        />
        <ActionButton
          icon={<RestoreIcon />}
          texto="Reativar desbravadores"
          onClick={() => setModalReativarAberto(true)}
        />
      </div>

      <h2 className={styles.tituloSecao}>Membros</h2>

      <MemberFilters
        ordenacao={ordenacao}
        onOrdenacaoChange={aoMudarOrdenacao}
        categoria={categoria}
        onCategoriaChange={aoMudarCategoria}
        onBuscaChange={aoMudarBusca}
      />

      {carregando && (
        <div className={styles.mensagemEstado}>
          <p>Carregando membros...</p>
          <CircularProgress
            size={32}
            sx={{ color: "var(--vinhoEscuro)", marginTop: "12px" }}
          />
        </div>
      )}

      {!carregando && erro && (
        <p className={styles.mensagemEstado}>{erro}</p>
      )}

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

      <CadastroDesbravadorModal
        aberto={modalCadastroAberto}
        onFechar={() => setModalCadastroAberto(false)}
        onCadastrar={aoCadastrarMembro}
      />
    </DashboardLayout>
  );
}

export default DesbravadoresPage;
