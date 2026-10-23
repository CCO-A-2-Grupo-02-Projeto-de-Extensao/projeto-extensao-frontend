import CelebrationIcon from "@mui/icons-material/Celebration";
import styles from "../../styles/seloFeriado.module.css";

export function SeloFeriado({ nome, grande = false, className = "" }) {
  return (
    <span
      className={`${styles.selo} ${grande ? styles.grande : ""} ${className}`}
      title={nome}
      aria-hidden="true"
    >
      <CelebrationIcon fontSize="inherit" />
    </span>
  );
}

export default SeloFeriado;
