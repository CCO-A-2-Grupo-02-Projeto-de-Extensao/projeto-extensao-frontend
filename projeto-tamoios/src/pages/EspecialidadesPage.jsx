
import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useEstadoDaTela } from "../hooks/useEstadoDaTela.js";
import { useVoltar } from "../hooks/useVoltar.js";
import { Tooltip } from "@mui/material";
import { Add, ArrowBack } from "@mui/icons-material";

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
  getEspecialidadesPaginadas,
} from "../services/classesService.js";

import { TODAS_CATEGORIAS } from "../utils/especialidadeCategorias.js";

import styles from "../styles/especialidadesPage.module.css";
import detalhe from "../styles/desbravadorDetalhePage.module.css";
import { Esqueleto } from "../components/Esqueleto/Esqueleto.jsx";

const TAMANHO_PAGINA = 10;

export function EspecialidadesPage() {
  const location = useLocation();
  const voltar = useVoltar("/dashboard");
  const buscaInicial = location.state?.busca ?? "";
  const [resultado, setResultado] = useState(null);
  const [versao, setVersao] = useState(0);
  const [erro, setErro] = useState("");

  const [ordenacao, setOrdenacao] = useEstadoDaTela("ordenacao", "az");
  const [categoria, setCategoria] = useEstadoDaTela("categoria", TODAS_CATEGORIAS);
  const [busca, setBusca] = useEstadoDaTela("busca", buscaInicial);
  const [paginaAtual, setPaginaAtual] = useEstadoDaTela("paginaAtual", 1);

  const [modalAberto, setModalAberto] = useState(false);
  const [especialidadeSelecionada, setEspecialidadeSelecionada] =
    useState(null);
  const [salvando, setSalvando] = useState(false);

  const [aExcluir, setAExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    let atual = true;

    getEspecialidadesPaginadas({
      pagina: paginaAtual,
      tamanho: TAMANHO_PAGINA,
      busca,
      categoria,
      ordenacao,
    })
      .then((dados) => {
        if (!atual) return;
        if (dados.totalPaginas > 0 && paginaAtual > dados.totalPaginas) {
          setPaginaAtual(dados.totalPaginas);
          return;
        }
        setResultado(dados);
        setErro("");
      })
      .catch(() => {
        if (atual) setErro("Não foi possível carregar as especialidades.");
      });

    return () => {
      atual = false;
    };
  }, [paginaAtual, busca, categoria, ordenacao, versao, setPaginaAtual]);

  const carregar = () => setVersao((valor) => valor + 1);

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

  const carregando = resultado === null && !erro;
  const especialidadesDaPagina = resultado?.especialidades ?? [];
  const totalPaginas = Math.max(1, resultado?.totalPaginas ?? 1);

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

      carregar();
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
      carregar();
    } catch {
      setErro(`Não foi possível excluir a especialidade ${aExcluir.nome}.`);
    } finally {
      setExcluindo(false);
      setAExcluir(null);
    }
  };

  const nenhumEncontrado = (resultado?.total ?? 0) === 0;

  return (
    <>
      <header className={detalhe.cabecalho}>
        <Tooltip arrow placement="bottom" title="Voltar para a tela anterior">
          <button
            type="button"
            className={detalhe.botaoVoltar}
            onClick={voltar}
          >
            <ArrowBack fontSize="small" />
          </button>
        </Tooltip>

        <div className={detalhe.cabecalhoTextos}>
          <p className={detalhe.sobretitulo}>Clube Tamoios</p>
          <h1 className={detalhe.titulo}>Especialidades</h1>
          <p className={detalhe.subtitulo}>
            Resumo das disciplinas e requisitos para os desbravadores.
          </p>
        </div>

        <div className={detalhe.cabecalhoAcoes}>
          <ActionButton
            icon={<Add />}
            texto="Adicionar disciplina"
            onClick={abrirModalAdicionar}
          />
        </div>
      </header>

      <section className={styles.secaoEspecialidades}>
        <h2 className={styles.tituloSecao}>Especialidades cadastradas</h2>

        {erro && <p className={styles.mensagemErro}>{erro}</p>}

        <EspecialidadeFilters
          key={location.key}
          busca={busca}
          ordenacao={ordenacao}
          onOrdenacaoChange={aoMudarOrdenacao}
          categoria={categoria}
          onCategoriaChange={aoMudarCategoria}
          onBuscaChange={aoMudarBusca}
        />

        {carregando ? (
          <Esqueleto linhas={8} rotulo="Carregando especialidades" />
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
              paginaAtual={paginaAtual}
              totalPaginas={totalPaginas}
              onPaginaChange={setPaginaAtual}
            />
          </>
        )}
      </section>

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
    </>
  );
}

export default EspecialidadesPage;
