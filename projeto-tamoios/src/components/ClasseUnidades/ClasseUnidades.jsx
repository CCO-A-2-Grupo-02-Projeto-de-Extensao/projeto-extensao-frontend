import { useCallback, useEffect, useMemo, useState } from "react";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import EditIcon from "@mui/icons-material/Edit";

import { Select } from "../Select/Select.jsx";
import { Input } from "../Input/Input.jsx";
import { Pagination } from "../Pagination/Pagination.jsx";
import { UnidadeModal } from "../UnidadeModal/UnidadeModal.jsx";

import { getUnidadesDaClasse } from "../../services/classesService.js";

import tabela from "../../styles/tabelaBase.module.css";
import styles from "../../styles/classeUnidades.module.css";

const TAMANHO_PAGINA = 10;

const SEXOS = { TODOS: "todos" };

export function ClasseUnidades({ idClasse, nomeClasse }) {
  const [unidades, setUnidades] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [ordenacao, setOrdenacao] = useState("az");
  const [sexo, setSexo] = useState(SEXOS.TODOS);
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);

  // { modo: "criar" | "editar", unidade }
  const [modal, setModal] = useState(null);

  const carregar = useCallback(() => {
    return getUnidadesDaClasse(idClasse)
      .then((lista) => {
        setUnidades(lista);
        setErro("");
      })
      .catch(() => setErro("Não foi possível carregar as unidades da classe."))
      .finally(() => setCarregando(false));
  }, [idClasse]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // O select de sexo é montado a partir do que existe nas unidades da classe —
  // evita oferecer um filtro que não devolve nada.
  const sexosDisponiveis = useMemo(
    () => [...new Set(unidades.map((item) => item.sexo).filter(Boolean))],
    [unidades]
  );

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return [...unidades]
      .filter((item) => item.nome.toLowerCase().includes(termo))
      .filter((item) => sexo === SEXOS.TODOS || item.sexo === sexo)
      .sort((a, b) =>
        ordenacao === "az"
          ? a.nome.localeCompare(b.nome)
          : b.nome.localeCompare(a.nome)
      );
  }, [unidades, busca, sexo, ordenacao]);

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / TAMANHO_PAGINA));

  const daPagina = useMemo(() => {
    const inicio = (pagina - 1) * TAMANHO_PAGINA;
    return filtradas.slice(inicio, inicio + TAMANHO_PAGINA);
  }, [filtradas, pagina]);

  const aoSalvar = async () => {
    await carregar();
    setModal(null);
  };

  if (carregando) {
    return <p className={styles.mensagemEstado}>Carregando unidades...</p>;
  }

  return (
    <div>
      {erro && <p className={styles.mensagemErro}>{erro}</p>}

      <div className={styles.barraAcoes}>
        <button
          type="button"
          className={styles.botaoAcao}
          onClick={() => setModal({ modo: "editar", unidade: null })}
          disabled={unidades.length === 0}
        >
          <EditIcon fontSize="small" />
          Editar Unidade
        </button>

        <button
          type="button"
          className={styles.botaoAcao}
          onClick={() => setModal({ modo: "criar", unidade: null })}
        >
          <GroupAddIcon fontSize="small" />
          Adicionar Unidade
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

        <div className={styles.campoSexo}>
          <Select
            value={sexo}
            onChange={(e) => {
              setSexo(e.target.value);
              setPagina(1);
            }}
            aria-label="Sexo"
          >
            <option value={SEXOS.TODOS}>Todos</option>
            {sexosDisponiveis.map((item) => (
              <option key={item} value={item}>
                {item}
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
            aria-label="Buscar unidade por nome"
          />
        </div>
      </div>

      {filtradas.length === 0 ? (
        <p className={styles.mensagemEstado}>
          Nenhuma unidade vinculada a esta classe.
        </p>
      ) : (
        <>
          <div className={styles.tabelaContainer}>
            <table className={tabela.tabela}>
              <thead>
                <tr>
                  <th>Nome da Unidade</th>
                  <th>Faixa Etária</th>
                  <th>Sexo</th>
                  <th>Conselheiro da Unidade</th>
                  <th>Quantidade de Desbravadores</th>
                </tr>
              </thead>

              <tbody>
                {daPagina.map((unidade) => (
                  <tr key={unidade.id}>
                    <td>{unidade.nome}</td>
                    <td>{unidade.faixaEtaria || "—"}</td>
                    <td>{unidade.sexo || "—"}</td>
                    <td>{unidade.conselheiro || "—"}</td>
                    <td>{unidade.quantidadeDesbravadores}</td>
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
        <UnidadeModal
          key={modal.modo}
          modo={modal.modo}
          idClasse={idClasse}
          nomeClasse={nomeClasse}
          unidadesDaClasse={unidades}
          onFechar={() => setModal(null)}
          onSalvo={aoSalvar}
        />
      )}
    </div>
  );
}

export default ClasseUnidades;
