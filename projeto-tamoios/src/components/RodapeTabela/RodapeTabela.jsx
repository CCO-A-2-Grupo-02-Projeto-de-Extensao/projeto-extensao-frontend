import { Pagination } from "../Pagination/Pagination.jsx";
import styles from "../../styles/classeInterna.module.css";

// Rodapé padrão das tabelas das abas da classe:
// "Mostrando X de Y <rotulo>" + paginação ao lado.
export function RodapeTabela({
  mostrando,
  total,
  rotulo,
  paginaAtual,
  totalPaginas,
  onPaginaChange,
}) {
  return (
    <div className={styles.rodape}>
      <p className={styles.rodapeTexto}>
        Mostrando <strong>{mostrando}</strong> de <strong>{total}</strong>{" "}
        {rotulo}
      </p>
      <Pagination
        paginaAtual={paginaAtual}
        totalPaginas={totalPaginas}
        onPaginaChange={onPaginaChange}
      />
    </div>
  );
}

export default RodapeTabela;
