import styles from "../../styles/esqueleto.module.css";

export function Esqueleto({ linhas = 5, altura = 44, rotulo = "Carregando" }) {
  return (
    <div className={styles.esqueleto} role="status" aria-label={rotulo}>
      {Array.from({ length: linhas }, (_, indice) => (
        <span
          key={indice}
          className={styles.barra}
          style={{ height: altura, animationDelay: `${indice * 80}ms` }}
        />
      ))}
    </div>
  );
}

export default Esqueleto;
