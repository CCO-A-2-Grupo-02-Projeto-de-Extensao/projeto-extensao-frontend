import styles from "../../styles/input.module.css";

export function Input(props) {
  return <input className={styles.input} {...props} />;
}
