import styles from "../../styles/modal.module.css";

export function Modal(props) {
  return <div className={styles.modal}>{props.children}</div>;
}

export default Modal;
