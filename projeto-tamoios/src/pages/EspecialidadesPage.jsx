import { useCallback, useEffect, useMemo, useState } from "react";
import { Add } from "@mui/icons-material";

import { DashboardLayout } from "../layout/DashboardLayout.jsx";
import { NomePagina } from "../components/NomePagina/NomePagina.jsx";
import { ActionButton } from "../components/ActionButton/ActionButton.jsx";
import { Pagination } from "../components/Pagination/Pagination.jsx";

import { EspecialidadeFilters } from "../components/EspecialidadeFilters/EspecialidadeFilters.jsx";
import { EspecialidadeTable } from "../components/EspecialidadeTable/EspecialidadeTable.jsx";
import { EspecialidadeModal } from "../components/EspecialidadeModal/EspecialidadeModal.jsx";
import { ConfirmacaoModal } from "../components/ConfirmacaoModal/ConfirmacaoModal.jsx";

import {
  atualizarEspecialidade,
  criarEspecialidade,
  excluirEspecialidade,
  getEspecialidades,
} from "../services/classesService.js";

import { TODAS_CATEGORIAS } from "../utils/especialidadeCategorias.js";

import styles from "../styles/especialidadesPage.module.css";

const TAMANHO_PAGINA = 10;

export function EspecialidadesPage() {
  const [especialidades, setEspecialidades] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [ordenacao, setOrdenacao] = useState("az");
  const [categoria, setCategoria] = useState(TODAS_CATEGORIAS);
  const [busca, setBusca] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);

  const [modalAberto, setModalAberto] = useState(false);
  const [especialidadeSelecionada, setEspecialidadeSelecionada] =
    useState(null);
  const [salvando, setSalvando] = useState(false);

  const [aExcluir, setAExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  const carregar = useCallback(() => {
    return getEspecialidades()
      .then((lista) => {
        setEspecialidades(lista);
        setErro("");
      })
      .catch(() => setErro("Não foi possível carregar as especialidades."))
      .finally(() => setCarregando(false));
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

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
          categoria === TODAS_CATEGORIAS ||
          especialidade.categoria === categoria
      )
      .sort((a, b) =>
        ordenacao === "az"
          ? a.nome.localeCompare(b.nome)
          : b.nome.localeCompare(a.nome)
      );
  }, [especialidades, busca, categoria, ordenacao]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(especialidadesFiltradas.length / TAMANHO_PAGINA)
  );

  const pagina = Math.min(paginaAtual, totalPaginas);

  const especialidadesDaPagina = useMemo(() => {
    const inicio = (pagina - 1) * TAMANHO_PAGINA;

    return especialidadesFiltradas.slice(inicio, inicio + TAMANHO_PAGINA);
  }, [especialidadesFiltradas, pagina]);

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

  const salvarEspecialidade = async (dados) => {
    setSalvando(true);

    try {
      if (especialidadeSelecionada) {
        await atualizarEspecialidade(especialidadeSelecionada.id, dados);
      } else {
        await criarEspecialidade(dados);
      }

      await carregar();
      fecharModal();
    } catch {
      setErro(
        especialidadeSelecionada
          ? `Não foi possível salvar a especialidade ${dados.nome}.`
          : `Não foi possível cadastrar a especialidade ${dados.nome}.`
      );
    } finally {
      setSalvando(false);
    }
  };

  const confirmarExclusao = async () => {
    setExcluindo(true);

    try {
      await excluirEspecialidade(aExcluir.id);
      await carregar();
    } catch {
      setErro(`Não foi possível excluir a especialidade ${aExcluir.nome}.`);
    } finally {
      setExcluindo(false);
      setAExcluir(null);
    }
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

      {erro && <p className={styles.mensagemErro}>{erro}</p>}

      <EspecialidadeFilters
        ordenacao={ordenacao}
        onOrdenacaoChange={aoMudarOrdenacao}
        categoria={categoria}
        onCategoriaChange={aoMudarCategoria}
        onBuscaChange={aoMudarBusca}
      />

      {carregando ? (
        <p className={styles.mensagemEstado}>Carregando especialidades...</p>
      ) : nenhumEncontrado ? (
        <p className={styles.mensagemEstado}>
          Nenhuma especialidade encontrada.
        </p>
      ) : (
        <>
          <EspecialidadeTable
            especialidades={especialidadesDaPagina}
            onEditar={abrirModalEditar}
            onExcluir={setAExcluir}
          />

          <Pagination
            paginaAtual={pagina}
            totalPaginas={totalPaginas}
            onPaginaChange={setPaginaAtual}
          />
        </>
      )}

      <EspecialidadeModal
        aberto={modalAberto}
        especialidade={especialidadeSelecionada}
        salvando={salvando}
        onFechar={fecharModal}
        onSalvar={salvarEspecialidade}
      />

      <ConfirmacaoModal
        aberto={Boolean(aExcluir)}
        titulo="Excluir especialidade"
        mensagem={
          aExcluir && (
            <>
              A especialidade{" "}
              <strong className={styles.nomeExcluir}>{aExcluir.nome}</strong>{" "}
              será excluída e sai das classes em que estiver vinculada.
            </>
          )
        }
        textoConfirmar={excluindo ? "Excluindo..." : "Excluir"}
        perigo
        onConfirmar={confirmarExclusao}
        onCancelar={() => setAExcluir(null)}
      />
    </DashboardLayout>
  );
}

export default EspecialidadesPage;
