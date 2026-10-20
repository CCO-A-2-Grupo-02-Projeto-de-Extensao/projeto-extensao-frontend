import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import styles from "../../styles/statusBadge.module.css";

export function StatusBadge({ enviados, total }) {
  if (enviados == null) {
    return <span className={styles.carregando}>—</span>;
  }

  const percentual = Math.round((enviados / total) * 100);
  const completo = enviados === total;

  return (
    <span
      className={`${styles.badge} ${completo ? styles.completo : styles.incompleto}`}
      title={`${enviados} de ${total} documentos enviados`}
    >
      <span className={styles.barra}>
        <span
          className={styles.preenchido}
          style={{ transform: `scaleX(${percentual / 100})` }}
        />
      </span>
      <span className={styles.valor}>{percentual}%</span>
      {completo ? (
        <CheckCircleIcon fontSize="small" />
      ) : (
        <span className={styles.contagem}>
          {enviados} de {total}
        </span>
      )}
    </span>
  );
}

export default StatusBadge;
