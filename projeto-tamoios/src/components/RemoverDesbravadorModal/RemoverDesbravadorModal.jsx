import { useMemo, useState } from "react";
import { Select } from "../Select/Select.jsx";
import { Input } from "../Input/Input.jsx";
import styles from "../../styles/removerDesbravadorModal.module.css";

export function RemoverDesbravadorModal({ aberto, membros, onFechar, onConfirmar }) {
  const [ordenacao, setOrdenacao] = useState("az");
  const [busca, setBusca] = useState("");
  const [selecionados, setSelecionados] = useState([]);

  const membrosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return membros
      .filter((membro) => membro.nome.toLowerCase().includes(termo))
      .sort((a, b) =>
        ordenacao === "az"
          ? a.nome.localeCompare(b.nome)
          : b.nome.localeCompare(a.nome)
      );
  }, [membros, busca, ordenacao]);

  const estaSelecionado = (membro) =>
    selecionados.some((selecionado) => selecionado.id === membro.id);

  const aoMarcar = (membro) => {
    setSelecionados((atual) =>
      estaSelecionado(membro)
        ? atual.filter((selecionado) => selecionado.id !== membro.id)
        : [...atual, membro]
    );
  };

  const limparEFechar = () => {
    setSelecionados([]);
    onFechar();
  };

  const aoRemover = () => {
    console.log(selecionados);
    onConfirmar?.(selecionados);
    setSelecionados([]);
    onFechar();
  };

  if (!aberto) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.colunaEsquerda}>
          <h2 className={styles.titulo}>Desativar Desbravador</h2>

          <div className={styles.filtros}>
            <Select
              value={ordenacao}
              onChange={(e) => setOrdenacao(e.target.value)}
              aria-label="Ordenação"
            >
              <option value="az">A-Z</option>
              <option value="za">Z-A</option>
            </Select>

            <div className={styles.campoBusca}>
              <Input
                type="search"
                placeholder="Buscar"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                aria-label="Buscar desbravador por nome"
              />
            </div>
          </div>

          <ul className={styles.lista}>
            {membrosFiltrados.map((membro) => (
              <li key={membro.id} className={styles.linha}>
                <label className={styles.linhaLabel}>
                  <input
                    type="checkbox"
                    checked={estaSelecionado(membro)}
                    onChange={() => aoMarcar(membro)}
                  />
                  <span>{membro.nome}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.colunaDireita}>
          <h2 className={styles.tituloDireita}>
            Desbravadores a serem desativados
          </h2>

          <ul className={styles.listaSelecionados}>
            {selecionados.length === 0 && (
              <p className={styles.mensagemVazia}>
                Nenhum desbravador selecionado.
              </p>
            )}

            {selecionados.map((membro) => (
              <li key={membro.id} className={styles.itemSelecionado}>
                <label className={styles.itemSelecionadoLabel}>
                  <input
                    type="checkbox"
                    checked
                    onChange={() => aoMarcar(membro)}
                  />
                  <span>{membro.nome}</span>
                </label>
              </li>
            ))}
          </ul>

          <div className={styles.botoes}>
            <button
              type="button"
              className={styles.botaoCancelar}
              onClick={limparEFechar}
            >
              Cancelar
            </button>
            <button
              type="button"
              className={styles.botaoRemover}
              onClick={aoRemover}
            >
              Desativar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RemoverDesbravadorModal;
