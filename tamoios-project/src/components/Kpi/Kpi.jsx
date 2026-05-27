import styles from "../../styles/kpi.module.css";
import aranduLogoImg from "../../assets/arandu_logo.png";

export function Kpi(props) {
  return (
    <div className={styles.box_kpi}>
      <div className={styles.box_kpi__img}>
        <img src={aranduLogoImg} alt="Imagem" />
      </div>
      <div className={styles.box_kpi__dados}>
        <h1>{props.valor}</h1>
        <h1>{props.texto}</h1>
      </div>
    </div>
  );
}

export default Kpi;
