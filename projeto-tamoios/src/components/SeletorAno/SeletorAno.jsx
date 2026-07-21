import AddIcon from "@mui/icons-material/Add";
import styles from "../../styles/seletorAno.module.css";

export function SeletorAno({ anos, anoSelecionado, onSelecionarAno, onAdicionarAno }) {
  return (
    <div className={styles.seletorAno}>
      {anos.map((ano) => (
        <button
          key={ano}
          type="button"
          className={`${styles.anoItem} ${
            ano === anoSelecionado ? styles.anoItemAtivo : ""
          }`}
          onClick={() => onSelecionarAno(ano)}
        >
          {ano}
        </button>
      ))}
      <button
        type="button"
        className={styles.botaoAdicionarAno}
        onClick={onAdicionarAno}
        title="Adicionar ano"
        aria-label="Adicionar ano"
      >
        <AddIcon fontSize="small" />
      </button>
    </div>
  );
}

export default SeletorAno;
