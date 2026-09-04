import { useCallback, useMemo, useState } from "react";
import { Add } from "@mui/icons-material";

import { DashboardLayout } from "../layout/DashboardLayout.jsx";
import { NomePagina } from "../components/NomePagina/NomePagina.jsx";
import { ActionButton } from "../components/ActionButton/ActionButton.jsx";
import { Pagination } from "../components/Pagination/Pagination.jsx";

import { EspecialidadeFilters } from "../components/EspecialidadeFilters/EspecialidadeFilters.jsx";
import { EspecialidadeTable } from "../components/EspecialidadeTable/EspecialidadeTable.jsx";
import { EspecialidadeModal } from "../components/EspecialidadeModal/EspecialidadeModal.jsx";

import styles from "../styles/especialidadesPage.module.css";

const TAMANHO_PAGINA = 10;

const CATEGORIAS = {
  TODOS: "todos",
  ARTES_MANUAIS: "Artes Manuais (AM)",
  ATIVIDADES_ESPIRITUAIS: "Atividades Espirituais (AE)",
  ATIVIDADES_RECREATIVAS: "Atividades Recreativas (AR)",
  ESTUDOS_NATUREZA: "Estudos da Natureza (EN)",
  HABILIDADES_DOMESTICAS: "Habilidades Domésticas (HD)",
};

const ESPECIALIDADES_INICIAIS = [
  {
    id: 1,
    nome: "Artesanato",
    categoria: CATEGORIAS.ARTES_MANUAIS,
    descricao:
      "Especialidade relacionada ao desenvolvimento de trabalhos manuais e criatividade.",
    imagem: null,
  },
  {
    id: 2,
    nome: "Cães",
    categoria: CATEGORIAS.ESTUDOS_NATUREZA,
    descricao:
      "Estudo sobre características, cuidados e comportamento dos cães.",
    imagem: null,
  },
  {
    id: 3,
    nome: "Culinária",
    categoria: CATEGORIAS.HABILIDADES_DOMESTICAS,
    descricao:
      "Aprendizado de técnicas básicas de preparo e organização de alimentos.",
    imagem: null,
  },
  {
    id: 4,
    nome: "Flores",
    categoria: CATEGORIAS.ESTUDOS_NATUREZA,
    descricao:
      "Estudo sobre diferentes tipos de flores, suas características e cuidados.",
    imagem: null,
  },
  {
    id: 5,
    nome: "Música",
    categoria: CATEGORIAS.ATIVIDADES_ESPIRITUAIS,
    descricao:
      "Conhecimentos relacionados à música e sua utilização nas atividades do clube.",
    imagem: null,
  },
  {
    id: 6,
    nome: "Natação",
    categoria: CATEGORIAS.ATIVIDADES_RECREATIVAS,
    descricao:
      "Desenvolvimento de conhecimentos e habilidades básicas de natação.",
    imagem: null,
  },
];

export function EspecialidadesPage() {
  const [especialidades, setEspecialidades] = useState(
    ESPECIALIDADES_INICIAIS
  );

  const [ordenacao, setOrdenacao] = useState("az");
  const [categoria, setCategoria] = useState(CATEGORIAS.TODOS);
  const [busca, setBusca] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);

  const [modalAberto, setModalAberto] = useState(false);
  const [especialidadeSelecionada, setEspecialidadeSelecionada] =
    useState(null);

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

  const especialidadesFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return [...especialidades]
      .filter((especialidade) =>
        especialidade.nome.toLowerCase().includes(termo)
      )
      .filter(
        (especialidade) =>
          categoria === CATEGORIAS.TODOS ||
          especialidade.categoria === categoria
      )
      .sort((a, b) => {
        if (ordenacao === "az") {
          return a.nome.localeCompare(b.nome);
        }

        return b.nome.localeCompare(a.nome);
      });
  }, [especialidades, busca, categoria, ordenacao]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(especialidadesFiltradas.length / TAMANHO_PAGINA)
  );

  const especialidadesDaPagina = useMemo(() => {
    const inicio = (paginaAtual - 1) * TAMANHO_PAGINA;

    return especialidadesFiltradas.slice(
      inicio,
      inicio + TAMANHO_PAGINA
    );
  }, [especialidadesFiltradas, paginaAtual]);

  const abrirModalAdicionar = () => {
    setEspecialidadeSelecionada(null);
    setModalAberto(true);
  };

  const abrirModalEditar = (especialidade) => {
    setEspecialidadeSelecionada(especialidade);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setEspecialidadeSelecionada(null);
  };

  const salvarEspecialidade = (dados) => {
    if (especialidadeSelecionada) {
      setEspecialidades((lista) =>
        lista.map((especialidade) =>
          especialidade.id === especialidadeSelecionada.id
            ? {
                ...especialidade,
                ...dados,
              }
            : especialidade
        )
      );
    } else {
      const novaEspecialidade = {
        id: Date.now(),
        ...dados,
        imagem: null,
      };

      setEspecialidades((lista) => [
        ...lista,
        novaEspecialidade,
      ]);
    }

    fecharModal();
  };

  const excluirEspecialidade = (especialidade) => {
    const confirmar = window.confirm(
      `Deseja excluir a especialidade "${especialidade.nome}"?`
    );

    if (!confirmar) {
      return;
    }

    setEspecialidades((lista) =>
      lista.filter(
        (item) => item.id !== especialidade.id
      )
    );
  };

  const nenhumEncontrado = especialidadesFiltradas.length === 0;

  return (
    <DashboardLayout>
      <NomePagina
        titulo="Especialidades"
        subtitulo="Resumo das disciplinas e requisitos para os desbravadores."
      />

      <div className={styles.acoes}>
        <ActionButton
          icon={<Add />}
          texto="Adicionar disciplina"
          onClick={abrirModalAdicionar}
        />
      </div>

      <h2 className={styles.tituloSecao}>Especialidades</h2>

      <EspecialidadeFilters
        ordenacao={ordenacao}
        onOrdenacaoChange={aoMudarOrdenacao}
        categoria={categoria}
        onCategoriaChange={aoMudarCategoria}
        onBuscaChange={aoMudarBusca}
      />

      {nenhumEncontrado ? (
        <p className={styles.mensagemEstado}>
          Nenhuma especialidade encontrada.
        </p>
      ) : (
        <EspecialidadeTable
          especialidades={especialidadesDaPagina}
          onEditar={abrirModalEditar}
          onExcluir={excluirEspecialidade}
        />
      )}

      {!nenhumEncontrado && (
        <Pagination
          paginaAtual={paginaAtual}
          totalPaginas={totalPaginas}
          onPaginaChange={setPaginaAtual}
        />
      )}

      <EspecialidadeModal
        aberto={modalAberto}
        especialidade={especialidadeSelecionada}
        onFechar={fecharModal}
        onSalvar={salvarEspecialidade}
      />
    </DashboardLayout>
  );
}

export default EspecialidadesPage;