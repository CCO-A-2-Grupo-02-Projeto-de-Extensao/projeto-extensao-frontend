import PersonIcon from "@mui/icons-material/Person";
import { iniciais } from "../../utils/iniciais.js";
import styles from "../../styles/avatar.module.css";

export function Avatar({
  nome,
  tamanho = 40,
  inativo = false,
  className = "",
}) {
  const temNome = Boolean(String(nome ?? "").trim());

  return (
    <span
      className={`${styles.avatar} ${inativo ? styles.inativo : ""} ${className}`}
      style={{ width: tamanho, height: tamanho, fontSize: tamanho * 0.36 }}
      aria-hidden="true"
    >
      {temNome ? (
        iniciais(nome)
      ) : (
        <PersonIcon style={{ fontSize: tamanho * 0.52 }} />
      )}
    </span>
  );
}

export default Avatar;
