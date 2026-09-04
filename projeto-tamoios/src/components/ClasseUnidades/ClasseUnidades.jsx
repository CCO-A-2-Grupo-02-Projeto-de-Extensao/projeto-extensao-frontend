import { useCallback, useEffect, useMemo, useState } from "react";
import { Tooltip } from "@mui/material";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import { Select } from "../Select/Select.jsx";
import { Input } from "../Input/Input.jsx";
import { Pagination } from "../Pagination/Pagination.jsx";
import { UnidadeModal } from "../UnidadeModal/UnidadeModal.jsx";
import { UnidadeDetalheModal } from "../UnidadeDetalheModal/UnidadeDetalheModal.jsx";
import { ConfirmacaoModal } from "../ConfirmacaoModal/ConfirmacaoModal.jsx";

import {
  deletarUnidade,
  getUnidadesDaClasse,
} from "../../services/classesService.js";

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
  const [visualizando, setVisualizando] = useState(null);
  const [aExcluir, setAExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

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

  // O modal se fecha sozinho depois de criar; ao editar ele fica aberto, e aqui
  // só recarregamos a tabela por trás dele.
  const aoSalvar = () => carregar();

  const confirmarExclusao = async () => {
    setExcluindo(true);

    try {
      await deletarUnidade(aExcluir.id);
      await carregar();
    } catch {
      setErro(`Não foi possível excluir a unidade ${aExcluir.nome}.`);
    } finally {
      setExcluindo(false);
      setAExcluir(null);
    }
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
                  <th className={styles.colunaAcao}>Ações</th>
                </tr>
              </thead>

              <tbody>
                {daPagina.map((unidade) => (
                  <tr
                    key={unidade.id}
                    className={tabela.linhaClicavel}
                    onClick={() => setVisualizando(unidade)}
                  >
                    <td>
                      <span className={styles.celulaNome}>
                        {unidade.nome}
                        {unidade.inconsistencias.length > 0 && (
                          <Tooltip
                            arrow
                            placement="top"
                            title={
                              <ul className={styles.listaInconsistencias}>
                                {unidade.inconsistencias.map((problema) => (
                                  <li key={problema}>{problema}</li>
                                ))}
                              </ul>
                            }
                          >
                            <WarningAmberIcon
                              className={styles.alerta}
                              fontSize="small"
                              aria-label={`${unidade.inconsistencias.length} problema(s) na unidade ${unidade.nome}`}
                            />
                          </Tooltip>
                        )}
                      </span>
                    </td>
                    <td>{unidade.faixaEtaria || "—"}</td>
                    <td>{unidade.sexo || "—"}</td>
                    <td>{unidade.conselheiro || "—"}</td>
                    <td>{unidade.quantidadeDesbravadores}</td>
                    <td className={styles.colunaAcao}>
                      <div className={styles.acoes}>
                        <button
                          type="button"
                          className={styles.botaoAcaoLinha}
                          onClick={(e) => {
                            e.stopPropagation();
                            setVisualizando(unidade);
                          }}
                          aria-label={`Visualizar ${unidade.nome}`}
                        >
                          <VisibilityIcon fontSize="small" />
                        </button>

                        <button
                          type="button"
                          className={styles.botaoAcaoLinha}
                          onClick={(e) => {
                            e.stopPropagation();
                            setModal({ modo: "editar", unidade });
                          }}
                          aria-label={`Editar ${unidade.nome}`}
                        >
                          <EditIcon fontSize="small" />
                        </button>

                        <button
                          type="button"
                          className={styles.botaoAcaoLinha}
                          onClick={(e) => {
                            e.stopPropagation();
                            setAExcluir(unidade);
                          }}
                          aria-label={`Excluir ${unidade.nome}`}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </button>
                      </div>
                    </td>
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

      <ConfirmacaoModal
        aberto={Boolean(aExcluir)}
        titulo="Excluir unidade"
        mensagem={
          aExcluir && (
            <>
              A unidade{" "}
              <strong className={styles.nomeExcluir}>{aExcluir.nome}</strong>{" "}
              será excluída.
              {aExcluir.quantidadeDesbravadores > 0 &&
                ` Os ${aExcluir.quantidadeDesbravadores} desbravadores dela ficam sem unidade — nenhum é excluído do clube.`}
            </>
          )
        }
        textoConfirmar={excluindo ? "Excluindo..." : "Excluir"}
        perigo
        onConfirmar={confirmarExclusao}
        onCancelar={() => setAExcluir(null)}
      />

      {visualizando && (
        <UnidadeDetalheModal
          unidade={visualizando}
          onFechar={() => setVisualizando(null)}
        />
      )}

      {modal && (
        <UnidadeModal
          key={`${modal.modo}-${modal.unidade?.id ?? "nova"}`}
          modo={modal.modo}
          unidadeInicial={modal.unidade}
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
