import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import styles from "../../styles/especialidadeTable.module.css";

export function EspecialidadeTable({
  especialidades,
  onEditar,
  onExcluir,
}) {
  return (
    <section className={styles.container}>
      <table className={styles.tabela}>
        <thead>
          <tr>
            <th>Especialidade</th>
            <th>Imagem</th>
            <th>Categoria</th>
            <th>Descrição</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {especialidades.map((especialidade) => (
            <tr key={especialidade.id}>
              <td className={styles.nome}>
                {especialidade.nome}
              </td>

              <td>
                <div className={styles.imagem}>
                  {especialidade.imagem ? (
                    <img
                      src={especialidade.imagem}
                      alt={especialidade.nome}
                    />
                  ) : (
                    <span>—</span>
                  )}
                </div>
              </td>

              <td>
                <span className={styles.categoria}>
                  {especialidade.categoria}
                </span>
              </td>

              <td className={styles.descricao}>
                {especialidade.descricao}
              </td>

              <td>
                <div className={styles.acoes}>
                  <button
                    type="button"
                    className={styles.botaoEditar}
                    onClick={() => onEditar(especialidade)}
                    aria-label={`Editar ${especialidade.nome}`}
                  >
                    <EditIcon fontSize="small" />
                  </button>

                  <button
                    type="button"
                    className={styles.botaoExcluir}
                    onClick={() =>
                      onExcluir(especialidade)
                    }
                    aria-label={`Excluir ${especialidade.nome}`}
                  >
                    <DeleteIcon fontSize="small" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default EspecialidadeTable;