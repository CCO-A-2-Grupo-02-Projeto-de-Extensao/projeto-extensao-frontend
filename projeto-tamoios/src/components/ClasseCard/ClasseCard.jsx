import { imagemDaClasse } from "../../utils/classeImagens.js";

import styles from "../../styles/classeCard.module.css";

export function ClasseCard({ classe, onAbrir }) {
  const imagem = imagemDaClasse(classe.nome);

  return (
    <button
      type="button"
      className={styles.card}
      onClick={() => onAbrir(classe)}
      aria-label={`Abrir a classe ${classe.nome}`}
    >
      <div className={styles.placa}>
        {imagem ? (
          <img src={imagem} alt={`Placa da classe ${classe.nome}`} />
        ) : (
          <span className={styles.semPlaca}>{classe.nome}</span>
        )}
      </div>

      <div className={styles.rodape}>
        <span className={styles.nome}>{classe.nome}</span>
      </div>
    </button>
  );
}

export default ClasseCard;
