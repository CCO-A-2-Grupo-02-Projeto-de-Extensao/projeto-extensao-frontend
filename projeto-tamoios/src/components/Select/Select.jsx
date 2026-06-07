import styles from "../../styles/select.module.css";

export function Select(props) {
  return (
    <select className={styles.select} {...props}>
      {props.children}
    </select>
  );
}

export default Select;
