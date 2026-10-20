import { BuscaGlobal } from "../BuscaGlobal/BuscaGlobal.jsx";
import styles from "../../styles/barraTopo.module.css";

function lerUsuario() {
  try {
    return JSON.parse(localStorage.getItem("usuario")) ?? {};
  } catch {
    return {};
  }
}

function iniciais(nome) {
  const partes = String(nome ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (partes.length === 0) return "?";
  const primeira = partes[0][0];
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primeira + ultima).toUpperCase();
}

export function BarraTopo() {
  const usuario = lerUsuario();
  const nome = usuario.nomePessoa || usuario.email || "Usuário";

  return (
    <header className={styles.barra}>
      <BuscaGlobal />

      <div className={styles.usuario} title={usuario.email}>
        <div className={styles.usuarioTextos}>
          <span className={styles.usuarioNome}>{nome}</span>
          {usuario.nomeCargo && (
            <span className={styles.usuarioCargo}>{usuario.nomeCargo}</span>
          )}
        </div>
        <span className={styles.avatar} aria-hidden="true">
          {iniciais(nome)}
        </span>
      </div>
    </header>
  );
}

export default BarraTopo;
