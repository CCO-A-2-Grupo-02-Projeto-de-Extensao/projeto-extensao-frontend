import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import styles from "../../styles/pagination.module.css";

export function Pagination({ paginaAtual, totalPaginas, onPaginaChange }) {
  const paginas = Array.from({ length: totalPaginas }, (_, i) => i + 1);

  return (
    <nav className={styles.paginacao} aria-label="Paginação de membros">
      <button
        type="button"
        className={styles.setaBotao}
        onClick={() => onPaginaChange(paginaAtual - 1)}
        disabled={paginaAtual === 1}
        aria-label="Página anterior"
      >
        <KeyboardDoubleArrowLeftIcon fontSize="small" />
      </button>

      {paginas.map((pagina) => (
        <button
          key={pagina}
          type="button"
          className={`${styles.paginaBotao} ${
            pagina === paginaAtual ? styles.paginaAtiva : ""
          }`}
          onClick={() => onPaginaChange(pagina)}
          aria-current={pagina === paginaAtual ? "page" : undefined}
        >
          {pagina}
        </button>
      ))}

      <button
        type="button"
        className={styles.setaBotao}
        onClick={() => onPaginaChange(paginaAtual + 1)}
        disabled={paginaAtual === totalPaginas}
        aria-label="Próxima página"
      >
        <KeyboardDoubleArrowRightIcon fontSize="small" />
      </button>
    </nav>
  );
}

export default Pagination;
