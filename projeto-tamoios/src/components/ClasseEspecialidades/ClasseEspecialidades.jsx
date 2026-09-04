import { useCallback, useEffect, useMemo, useState } from "react";
import BookmarkAddIcon from "@mui/icons-material/BookmarkAdd";
import BookmarkRemoveIcon from "@mui/icons-material/BookmarkRemove";

import { Select } from "../Select/Select.jsx";
import { Input } from "../Input/Input.jsx";
import { Pagination } from "../Pagination/Pagination.jsx";
import { SelecaoModal } from "../SelecaoModal/SelecaoModal.jsx";
import { Insignia } from "../Insignia/Insignia.jsx";
import {
  CATEGORIAS_ESPECIALIDADES,
  TODAS_CATEGORIAS,
} from "../../utils/especialidadeCategorias.js";

import {
  desvincularEspecialidade,
  getEspecialidades,
  getEspecialidadesDaClasse,
  vincularEspecialidades,
} from "../../services/classesService.js";

import tabela from "../../styles/tabelaBase.module.css";
import styles from "../../styles/classeEspecialidades.module.css";

const TAMANHO_PAGINA = 10;

export function ClasseEspecialidades({ idClasse }) {
  const [especialidades, setEspecialidades] = useState([]);
  const [disponiveis, setDisponiveis] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [ordenacao, setOrdenacao] = useState("az");
  const [categoria, setCategoria] = useState(TODAS_CATEGORIAS);
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);

  const [modal, setModal] = useState(null); // "adicionar" | "remover"

  const carregar = useCallback(() => {
    return getEspecialidadesDaClasse(idClasse)
      .then((lista) => {
        setEspecialidades(lista);
        setErro("");
      })
      .catch(() =>
        setErro("Não foi possível carregar as especialidades da classe.")
      )
      .finally(() => setCarregando(false));
  }, [idClasse]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return [...especialidades]
      .filter((item) => item.nome.toLowerCase().includes(termo))
      .filter(
        (item) =>
          categoria === TODAS_CATEGORIAS ||
          item.categoria === categoria
      )
      .sort((a, b) =>
        ordenacao === "az"
          ? a.nome.localeCompare(b.nome)
          : b.nome.localeCompare(a.nome)
      );
  }, [especialidades, busca, categoria, ordenacao]);

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / TAMANHO_PAGINA));

  const daPagina = useMemo(() => {
    const inicio = (pagina - 1) * TAMANHO_PAGINA;
    return filtradas.slice(inicio, inicio + TAMANHO_PAGINA);
  }, [filtradas, pagina]);

  const abrirModal = async (acao) => {
    setModal({ acao, carregando: acao === "adicionar" });

    if (acao === "adicionar") {
      try {
        const todas = await getEspecialidades();
        const jaVinculadas = new Set(especialidades.map((item) => item.id));
        setDisponiveis(todas.filter((item) => !jaVinculadas.has(item.id)));
      } catch {
        setDisponiveis([]);
      } finally {
        setModal((atual) => (atual ? { ...atual, carregando: false } : atual));
      }
    }
  };

  const itensDoModal = useMemo(() => {
    if (!modal) return [];

    const origem = modal.acao === "adicionar" ? disponiveis : especialidades;

    return origem.map((item) => ({
      id: item.id,
      nome: item.nome,
      detalhe: item.categoria,
    }));
  }, [modal, disponiveis, especialidades]);

  const confirmarModal = async (ids) => {
    try {
      if (modal.acao === "adicionar") {
        await vincularEspecialidades(idClasse, ids);
      } else {
        await Promise.all(
          ids.map((id) => desvincularEspecialidade(idClasse, id))
        );
      }

      await carregar();
      setModal(null);
    } catch {
      setErro(
        modal.acao === "adicionar"
          ? "Não foi possível adicionar as especialidades."
          : "Não foi possível remover as especialidades."
      );
    }
  };

  if (carregando) {
    return (
      <p className={styles.mensagemEstado}>Carregando especialidades...</p>
    );
  }

  return (
    <div>
      {erro && <p className={styles.mensagemErro}>{erro}</p>}

      <div className={styles.barraAcoes}>
        <button
          type="button"
          className={styles.botaoAcao}
          onClick={() => abrirModal("remover")}
        >
          <BookmarkRemoveIcon fontSize="small" />
          Remover Especialidade
        </button>

        <button
          type="button"
          className={styles.botaoAcao}
          onClick={() => abrirModal("adicionar")}
        >
          <BookmarkAddIcon fontSize="small" />
          Adicionar Especialidade
        </button>
      </div>

      <div className={styles.filtros}>
        <div className={styles.campoOrdenacao}>
          <Select
            value={ordenacao}
            onChange={(e) => setOrdenacao(e.target.value)}
            aria-label="Ordenação"
          >
            <option value="az">A-Z</option>
            <option value="za">Z-A</option>
          </Select>
        </div>

        <div className={styles.campoCategoria}>
          <Select
            value={categoria}
            onChange={(e) => {
              setCategoria(e.target.value);
              setPagina(1);
            }}
            aria-label="Categoria"
          >
            <option value={TODAS_CATEGORIAS}>Todos</option>

            {CATEGORIAS_ESPECIALIDADES.map((nome) => (
              <option key={nome} value={nome}>
                {nome}
              </option>
            ))}
          </Select>
        </div>

        <div className={styles.campoBusca}>
          <Input
            type="search"
            placeholder="Buscar"
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value);
              setPagina(1);
            }}
            aria-label="Buscar especialidade por nome"
          />
        </div>
      </div>

      {filtradas.length === 0 ? (
        <p className={styles.mensagemEstado}>
          Nenhuma especialidade vinculada a esta classe.
        </p>
      ) : (
        <>
          <div className={styles.tabelaContainer}>
            <table className={tabela.tabela}>
              <thead>
                <tr>
                  <th>Especialidade</th>
                  <th>Insígnia</th>
                  <th>Categoria</th>
                  <th>Descrição</th>
                </tr>
              </thead>

              <tbody>
                {daPagina.map((item) => (
                  <tr key={item.id}>
                    <td>{item.nome}</td>

                    <td>
                      <Insignia
                        src={item.imagem}
                        alt={item.nome}
                        className={styles.insignia}
                      />
                    </td>

                    <td>{item.categoria || "—"}</td>
                    <td className={styles.descricao}>{item.descricao || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            paginaAtual={pagina}
            totalPaginas={totalPaginas}
            onPaginaChange={setPagina}
          />
        </>
      )}

      {modal && (
        <SelecaoModal
          key={modal.acao}
          carregando={modal.carregando}
          variante={modal.acao === "remover" ? "remover" : "adicionar"}
          titulo={
            modal.acao === "remover"
              ? "Remover Especialidade"
              : "Adicionar Especialidade"
          }
          tituloSelecionados={
            modal.acao === "remover"
              ? "Especialidades a serem removidas"
              : "Especialidades a serem adicionadas"
          }
          itens={itensDoModal}
          onFechar={() => setModal(null)}
          onConfirmar={confirmarModal}
        />
      )}
    </div>
  );
}

export default ClasseEspecialidades;
