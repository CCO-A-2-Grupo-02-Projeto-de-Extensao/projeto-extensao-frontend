import { useCallback, useEffect, useMemo, useState } from "react";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import PersonRemoveAlt1Icon from "@mui/icons-material/PersonRemoveAlt1";

import { Select } from "../Select/Select.jsx";
import { Input } from "../Input/Input.jsx";
import { Pagination } from "../Pagination/Pagination.jsx";
import { SelecaoModal } from "../SelecaoModal/SelecaoModal.jsx";

import {
  desvincularPessoaDaClasse,
  getParticipantesDaClasse,
  getPessoasForaDaClasse,
  vincularPessoaAClasse,
} from "../../services/classesService.js";

import styles from "../../styles/classeParticipantes.module.css";

const TAMANHO_PAGINA = 15;

const PAPEIS = { TODOS: "todos", INSTRUTORES: "instrutor", ALUNOS: "aluno" };

// A categoria vem calculada do backend (PessoaResponse.categoria) a partir do
// cargo. Quem não é instrutor nem administrativo conta como aluno.
function ehInstrutor(participante) {
  const categoria = (participante.categoria || "").toLowerCase();
  return categoria === "instrutor" || categoria === "administrativo";
}

export function ClasseParticipantes({ idClasse }) {
  const [participantes, setParticipantes] = useState([]);
  const [candidatos, setCandidatos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [ordenacao, setOrdenacao] = useState("az");
  const [papel, setPapel] = useState(PAPEIS.TODOS);
  const [busca, setBusca] = useState("");
  const [paginaAlunos, setPaginaAlunos] = useState(1);

  // { tipo: "instrutor" | "aluno", acao: "adicionar" | "remover" }
  const [modal, setModal] = useState(null);

  const carregar = useCallback(() => {
    return getParticipantesDaClasse(idClasse)
      .then((lista) => {
        setParticipantes(lista);
        setErro("");
      })
      .catch(() => setErro("Não foi possível carregar os participantes."))
      .finally(() => setCarregando(false));
  }, [idClasse]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const aplicarFiltros = useCallback(
    (lista) => {
      const termo = busca.trim().toLowerCase();

      return [...lista]
        .filter((item) => item.nome.toLowerCase().includes(termo))
        .sort((a, b) =>
          ordenacao === "az"
            ? a.nome.localeCompare(b.nome)
            : b.nome.localeCompare(a.nome)
        );
    },
    [busca, ordenacao]
  );

  const instrutores = useMemo(() => {
    if (papel === PAPEIS.ALUNOS) return [];
    return aplicarFiltros(participantes.filter(ehInstrutor));
  }, [participantes, papel, aplicarFiltros]);

  const alunos = useMemo(() => {
    if (papel === PAPEIS.INSTRUTORES) return [];
    return aplicarFiltros(
      participantes.filter((item) => !ehInstrutor(item))
    );
  }, [participantes, papel, aplicarFiltros]);

  const totalPaginasAlunos = Math.max(
    1,
    Math.ceil(alunos.length / TAMANHO_PAGINA)
  );

  const alunosDaPagina = useMemo(() => {
    const inicio = (paginaAlunos - 1) * TAMANHO_PAGINA;
    return alunos.slice(inicio, inicio + TAMANHO_PAGINA);
  }, [alunos, paginaAlunos]);

  const abrirModal = async (tipo, acao) => {
    setModal({ tipo, acao, carregando: acao === "adicionar" });

    if (acao === "adicionar") {
      try {
        const lista = await getPessoasForaDaClasse(idClasse);
        setCandidatos(lista);
      } catch {
        setCandidatos([]);
      } finally {
        setModal((atual) => (atual ? { ...atual, carregando: false } : atual));
      }
    }
  };

  const itensDoModal = useMemo(() => {
    if (!modal) return [];

    const filtrarPorTipo = (lista) =>
      lista.filter((pessoa) =>
        modal.tipo === "instrutor" ? ehInstrutor(pessoa) : !ehInstrutor(pessoa)
      );

    const origem =
      modal.acao === "adicionar"
        ? filtrarPorTipo(candidatos)
        : filtrarPorTipo(participantes);

    return origem.map((pessoa) => ({
      id: pessoa.id,
      nome: pessoa.nome,
      detalhe: pessoa.unidade || "Sem unidade",
    }));
  }, [modal, candidatos, participantes]);

  const confirmarModal = async (ids) => {
    try {
      if (modal.acao === "adicionar") {
        await Promise.all(
          ids.map((id) => vincularPessoaAClasse(id, idClasse))
        );
      } else {
        await Promise.all(ids.map((id) => desvincularPessoaDaClasse(id)));
      }

      await carregar();
      setModal(null);
    } catch {
      setErro(
        modal.acao === "adicionar"
          ? "Não foi possível adicionar à classe."
          : "Não foi possível remover da classe."
      );
    }
  };

  const renderTabela = (lista) => (
    <div className={styles.tabelaContainer}>
      <table className={styles.tabela}>
        <thead>
          <tr>
            <th>Nome/Sobrenome</th>
            <th>Unidade</th>
            <th>Papéis</th>
            <th>Número do Responsável</th>
          </tr>
        </thead>

        <tbody>
          {lista.map((pessoa) => (
            <tr key={pessoa.id}>
              <td className={styles.celulaNome}>{pessoa.nome}</td>
              <td>{pessoa.unidade || "—"}</td>
              <td>{pessoa.papel || "—"}</td>
              <td>{pessoa.telefoneResponsavel || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (carregando) {
    return <p className={styles.mensagemEstado}>Carregando participantes...</p>;
  }

  return (
    <div>
      {erro && <p className={styles.mensagemErro}>{erro}</p>}

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

        <div className={styles.campoPapel}>
          <Select
            value={papel}
            onChange={(e) => {
              setPapel(e.target.value);
              setPaginaAlunos(1);
            }}
            aria-label="Papel"
          >
            <option value={PAPEIS.TODOS}>Todos</option>
            <option value={PAPEIS.INSTRUTORES}>Instrutores</option>
            <option value={PAPEIS.ALUNOS}>Alunos</option>
          </Select>
        </div>

        <div className={styles.campoBusca}>
          <Input
            type="search"
            placeholder="Buscar"
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value);
              setPaginaAlunos(1);
            }}
            aria-label="Buscar participante por nome"
          />
        </div>
      </div>

      {papel !== PAPEIS.ALUNOS && (
        <section className={styles.secao}>
          <h2 className={styles.tituloSecao}>Instrutores</h2>

          <div className={styles.acoes}>
            <button
              type="button"
              className={styles.botaoAcao}
              onClick={() => abrirModal("instrutor", "adicionar")}
            >
              <PersonAddAlt1Icon fontSize="small" />
              Adicionar instrutor
            </button>

            <button
              type="button"
              className={styles.botaoAcao}
              onClick={() => abrirModal("instrutor", "remover")}
            >
              <PersonRemoveAlt1Icon fontSize="small" />
              Remover instrutor
            </button>
          </div>

          {instrutores.length === 0 ? (
            <p className={styles.mensagemEstado}>
              Nenhum instrutor nesta classe.
            </p>
          ) : (
            renderTabela(instrutores)
          )}
        </section>
      )}

      {papel !== PAPEIS.INSTRUTORES && (
        <section className={styles.secao}>
          <h2 className={styles.tituloSecao}>Alunos</h2>

          <div className={styles.acoes}>
            <button
              type="button"
              className={styles.botaoAcao}
              onClick={() => abrirModal("aluno", "adicionar")}
            >
              <PersonAddAlt1Icon fontSize="small" />
              Adicionar aluno
            </button>

            <button
              type="button"
              className={styles.botaoAcao}
              onClick={() => abrirModal("aluno", "remover")}
            >
              <PersonRemoveAlt1Icon fontSize="small" />
              Remover aluno
            </button>
          </div>

          {alunos.length === 0 ? (
            <p className={styles.mensagemEstado}>
              Nenhum aluno nesta classe.
            </p>
          ) : (
            <>
              {renderTabela(alunosDaPagina)}

              <Pagination
                paginaAtual={paginaAlunos}
                totalPaginas={totalPaginasAlunos}
                onPaginaChange={setPaginaAlunos}
              />
            </>
          )}
        </section>
      )}

      {modal && (
        <SelecaoModal
          key={`${modal.tipo}-${modal.acao}`}
          carregando={modal.carregando}
          variante={modal.acao === "remover" ? "remover" : "adicionar"}
          titulo={`${
            modal.acao === "adicionar" ? "Adicionar" : "Remover"
          } ${modal.tipo === "instrutor" ? "Instrutor" : "Desbravador"}`}
          tituloSelecionados={
            modal.acao === "adicionar"
              ? "Selecionados para adicionar"
              : "Selecionados para remover"
          }
          itens={itensDoModal}
          onFechar={() => setModal(null)}
          onConfirmar={confirmarModal}
        />
      )}
    </div>
  );
}

export default ClasseParticipantes;
