import { useMemo, useState } from "react";
import { Select } from "../Select/Select.jsx";
import { Input } from "../Input/Input.jsx";
import styles from "../../styles/removerDesbravadorModal.module.css";
import { useFecharAoClicarFora } from "../../hooks/useFecharAoClicarFora.js";
import { ConfirmacaoModal } from "../ConfirmacaoModal/ConfirmacaoModal.jsx";

export function ReativarDesbravadorModal({ aberto, membros, onFechar, onConfirmar }) {
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

  const [confirmandoDescarte, setConfirmandoDescarte] = useState(false);

  const limparEFechar = () => {
    setSelecionados([]);
    setConfirmandoDescarte(false);
    onFechar();
  };

  // Só pergunta se há seleção a perder; sem nada marcado, fecha direto.
  const aoClicarCancelar = () => {
    if (selecionados.length === 0) {
      limparEFechar();
      return;
    }
    setConfirmandoDescarte(true);
  };

  const aoReativar = () => {
    console.log(selecionados);
    onConfirmar?.(selecionados);
    setSelecionados([]);
    onFechar();
  };

  // Clicar fora preserva a seleção feita; Cancelar é que limpa.
  const fecharAoClicarFora = useFecharAoClicarFora(onFechar);

  if (!aberto) return null;

  return (
    <div className={styles.overlay} {...fecharAoClicarFora}>
      <div className={styles.modal}>
        <div className={styles.colunaEsquerda}>
          <h2 className={styles.titulo}>Reativar Desbravador</h2>

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
            {membrosFiltrados.length === 0 && (
              <p className={styles.mensagemVazia}>
                Nenhum desbravador inativo encontrado.
              </p>
            )}

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
            Desbravadores a serem reativados
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
              onClick={aoClicarCancelar}
            >
              Cancelar
            </button>
            <button
              type="button"
              className={styles.botaoReativar}
              onClick={aoReativar}
            >
              Reativar
            </button>
          </div>
        </div>
      </div>

      <ConfirmacaoModal
        aberto={confirmandoDescarte}
        titulo="Descartar seleção?"
        mensagem={
          selecionados.length === 1
            ? "O desbravador marcado para reativação será desmarcado."
            : `Os ${selecionados.length} desbravadores marcados para reativação serão desmarcados.`
        }
        textoConfirmar="Descartar"
        textoCancelar="Continuar editando"
        perigo
        onConfirmar={limparEFechar}
        onCancelar={() => setConfirmandoDescarte(false)}
      />
    </div>
  );
}

export default ReativarDesbravadorModal;
