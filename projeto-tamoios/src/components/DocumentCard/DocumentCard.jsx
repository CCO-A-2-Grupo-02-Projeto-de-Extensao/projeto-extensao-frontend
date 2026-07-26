import DescriptionIcon from "@mui/icons-material/Description";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import styles from "../../styles/documentCard.module.css";

export function DocumentCard({ titulo, arquivo, onEnviar, onVisualizar, onRemover }) {
  const enviado = Boolean(arquivo);

  return (
    <div className={styles.card}>
      <div className={styles.cabecalho}>
        {enviado ? (
          <CheckCircleIcon className={styles.iconeEnviado} />
        ) : (
          <DescriptionIcon className={styles.iconePendente} />
        )}
        <span className={styles.titulo}>{titulo}</span>
      </div>

      <p className={enviado ? styles.statusEnviado : styles.statusPendente}>
        {enviado ? "✔ Arquivo enviado" : "Não enviado"}
      </p>

      {enviado ? (
        <div className={styles.acoes}>
          <button
            type="button"
            className={styles.botaoIcone}
            onClick={onEnviar}
            title="Trocar arquivo"
            aria-label="Trocar arquivo"
          >
            <SwapHorizIcon fontSize="small" />
          </button>
          <button
            type="button"
            className={styles.botaoIcone}
            onClick={onVisualizar}
            title="Visualizar"
            aria-label="Visualizar arquivo"
          >
            <VisibilityIcon fontSize="small" />
          </button>
          <button
            type="button"
            className={styles.botaoIcone}
            onClick={onRemover}
            title="Remover"
            aria-label="Remover arquivo"
          >
            <DeleteOutlineIcon fontSize="small" />
          </button>
        </div>
      ) : (
        <button type="button" className={styles.botaoAdicionar} onClick={onEnviar}>
          Adicionar arquivo
        </button>
      )}
    </div>
  );
}

export default DocumentCard;
