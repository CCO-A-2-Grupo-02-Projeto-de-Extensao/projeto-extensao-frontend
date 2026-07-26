import { StatusBadge } from "../StatusBadge/StatusBadge.jsx";
import styles from "../../styles/memberTable.module.css";

export function MemberTable({ titulo, membros, onSelecionarMembro }) {
  return (
    <section className={styles.grupoTabela}>
      {titulo && <h3 className={styles.tituloGrupo}>{titulo}</h3>}

      <table className={styles.tabela}>
        <thead>
          <tr>
            <th>Nome/Sobrenome</th>
            <th>Papéis</th>
            <th>% Documentação</th>
          </tr>
        </thead>
        <tbody>
          {membros.map((membro) => (
            <tr
              key={membro.id}
              className={styles.linhaClicavel}
              onClick={() => onSelecionarMembro?.(membro)}
            >
              <td>{membro.nome}</td>
              <td>{membro.papel}</td>
              <td>
                <StatusBadge completo={membro.documentacao} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default MemberTable;
