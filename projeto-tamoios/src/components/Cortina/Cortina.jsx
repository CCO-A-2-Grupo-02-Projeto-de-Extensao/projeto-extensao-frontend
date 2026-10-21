import clubeTamoiosLogoImg from "../../assets/clube_tamoios_logo.webp";
import styles from "../../styles/cortina.module.css";

export function Cortina({ variante, origem, onFim }) {
  const comLogo = variante === "cobrir" || variante === "revelar";
  const terminaNoLogo = variante === "cobrir";

  const aoTerminar = (e) => {
    const ultimo = terminaNoLogo
      ? e.target !== e.currentTarget
      : e.target === e.currentTarget;
    if (ultimo) onFim?.();
  };

  return (
    <div
      className={`${styles.cortina} ${styles[variante]}`}
      style={
        origem && {
          "--cortinaX": `${origem.x}px`,
          "--cortinaY": `${origem.y}px`,
          "--cortinaRaio": `${origem.raio}px`,
        }
      }
      onAnimationEnd={aoTerminar}
      aria-hidden="true"
    >
      {comLogo && (
        <img src={clubeTamoiosLogoImg} alt="" className={styles.logo} />
      )}
    </div>
  );
}

export default Cortina;
