import { StatusBadge } from "../StatusBadge/StatusBadge.jsx";
import tabela from "../../styles/tabelaBase.module.css";
import styles from "../../styles/memberTable.module.css";
import { FotoMembro } from "../FotoMembro/FotoMembro.jsx";
import { useDocumentosDaPessoa } from "../../hooks/useDocumentosDaPessoa.js";
import { DOCUMENTOS, DOCUMENTO_FOTO } from "../../utils/desbravadorForm.jsx";

function LinhaMembro({ membro, onSelecionar }) {
  const documentos = useDocumentosDaPessoa(membro.id);
  const enviados = documentos
    ? DOCUMENTOS.filter((documento) => documentos[documento.id]).length
    : null;

  return (
    <tr className={tabela.linhaClicavel} onClick={() => onSelecionar?.(membro)}>
      <td className={styles.colunaFoto}>
        <FotoMembro
          membro={membro}
          documento={documentos?.[DOCUMENTO_FOTO.id]}
        />
      </td>
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
        <StatusBadge enviados={enviados} total={DOCUMENTOS.length} />
      </td>
    </tr>
  );
}

export function MemberTable({ titulo, membros, onSelecionarMembro }) {
  return (
    <section className={styles.grupoTabela}>
      {titulo && <h3 className={styles.tituloGrupo}>{titulo}</h3>}

      <table className={`${tabela.tabela} ${styles.colunas}`}>
        <thead>
          <tr>
            <th className={styles.colunaFoto} aria-label="Foto" />
            <th>Nome/Sobrenome</th>
            <th>Papéis</th>
            <th>Situação</th>
            <th>% Documentação</th>
          </tr>
        </thead>
        <tbody>
          {membros.map((membro) => (
            <LinhaMembro
              key={membro.id}
              membro={membro}
              onSelecionar={onSelecionarMembro}
            />
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default MemberTable;
