import styles from "../../styles/confirmacaoModal.module.css";

export function ConfirmacaoModal({
  aberto,
  titulo,
  mensagem,
  textoConfirmar = "Confirmar",
  textoCancelar = "Cancelar",
  perigo = false,
  onConfirmar,
  onCancelar,
}) {
  if (!aberto) return null;

  return (
    <div className={styles.overlay} onMouseDown={onCancelar}>
      <div
        className={styles.modal}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirmacao-titulo"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 id="confirmacao-titulo" className={styles.titulo}>
          {titulo}
        </h2>

        <p className={styles.mensagem}>{mensagem}</p>

        <div className={styles.botoes}>
          <button
            type="button"
            className={styles.botaoCancelar}
            onClick={onCancelar}
          >
            {textoCancelar}
          </button>

          <button
            type="button"
            className={`${styles.botaoConfirmar} ${
              perigo ? styles.botaoPerigo : ""
            }`}
            onClick={onConfirmar}
          >
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmacaoModal;
