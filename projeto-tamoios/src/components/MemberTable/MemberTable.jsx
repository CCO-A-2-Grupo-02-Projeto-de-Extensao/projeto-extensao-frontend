import { StatusBadge } from "../StatusBadge/StatusBadge.jsx";
import tabela from "../../styles/tabelaBase.module.css";
import styles from "../../styles/memberTable.module.css";

export function MemberTable({ titulo, membros, onSelecionarMembro }) {
  return (
    <section className={styles.grupoTabela}>
      {titulo && <h3 className={styles.tituloGrupo}>{titulo}</h3>}

      <table className={`${tabela.tabela} ${styles.colunas}`}>
        <thead>
          <tr>
            <th>Nome/Sobrenome</th>
            <th>Papéis</th>
            <th>Situação</th>
            <th>% Documentação</th>
          </tr>
        </thead>
        <tbody>
          {membros.map((membro) => (
            <tr
              key={membro.id}
              className={tabela.linhaClicavel}
              onClick={() => onSelecionarMembro?.(membro)}
            >
              <td>{membro.nome}</td>
              <td>{membro.papel}</td>
              <td>
                <span
                  className={`${styles.tagSituacao} ${
                    membro.ativo ? styles.tagAtivo : styles.tagDesativado
                  }`}
                >
                  {membro.ativo ? "Ativo" : "Desativado"}
                </span>
              </td>
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
