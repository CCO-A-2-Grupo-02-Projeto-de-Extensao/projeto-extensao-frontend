import styles from "../../styles/actionButton.module.css";

export function ActionButton({ icon, texto, onClick }) {
  return (
    <button type="button" className={styles.actionButton} onClick={onClick}>
      <span className={styles.icon}>{icon}</span>
      {texto}
    </button>
  );
}

export default ActionButton;
