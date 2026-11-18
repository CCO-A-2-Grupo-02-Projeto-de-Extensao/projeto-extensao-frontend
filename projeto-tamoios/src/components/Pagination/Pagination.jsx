import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import { ELIPSE, montarPaginas } from "../../utils/paginacao.js";
import styles from "../../styles/pagination.module.css";

export function Pagination({
  paginaAtual,
  totalPaginas,
  onPaginaChange,
  rotulo = "Paginação",
}) {
  const paginas = montarPaginas(paginaAtual, totalPaginas);

  return (
    <nav className={styles.paginacao} aria-label={rotulo}>
      <button
        type="button"
        className={styles.setaBotao}
        onClick={() => onPaginaChange(paginaAtual - 1)}
        disabled={paginaAtual <= 1}
        aria-label="Página anterior"
      >
        <KeyboardDoubleArrowLeftIcon fontSize="small" />
      </button>

      {paginas.map((pagina, indice) =>
        pagina === ELIPSE ? (
          <span
            key={`${ELIPSE}-${indice}`}
            className={styles.elipse}
            aria-hidden="true"
          >
            …
          </span>
        ) : (
          <button
            key={pagina}
            type="button"
            className={`${styles.paginaBotao} ${
              pagina === paginaAtual ? styles.paginaAtiva : ""
            }`}
            onClick={() => onPaginaChange(pagina)}
            aria-label={`Página ${pagina}`}
            aria-current={pagina === paginaAtual ? "page" : undefined}
          >
            {pagina}
          </button>
        )
      )}

      <button
        type="button"
        className={styles.setaBotao}
        onClick={() => onPaginaChange(paginaAtual + 1)}
        disabled={paginaAtual >= totalPaginas}
        aria-label="Próxima página"
      >
        <KeyboardDoubleArrowRightIcon fontSize="small" />
      </button>
    </nav>
  );
}

export default Pagination;
