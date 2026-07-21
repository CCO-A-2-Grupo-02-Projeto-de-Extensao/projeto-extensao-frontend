import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import styles from "../../styles/statusBadge.module.css";

export function StatusBadge({ completo }) {
  if (completo) {
    return (
      <span className={`${styles.badge} ${styles.completo}`}>
        <SentimentSatisfiedAltIcon fontSize="small" />
        Documentação completa
      </span>
    );
  }

  return (
    <span className={`${styles.badge} ${styles.incompleto}`}>
      <SentimentDissatisfiedIcon fontSize="small" />
      Documentação incompleta
    </span>
  );
}

export default StatusBadge;
