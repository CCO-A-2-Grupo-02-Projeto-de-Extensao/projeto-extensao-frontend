import { BuscaGlobal } from "../BuscaGlobal/BuscaGlobal.jsx";
import { Avatar } from "../Avatar/Avatar.jsx";
import { InterruptorTema } from "../InterruptorTema/InterruptorTema.jsx";
import styles from "../../styles/barraTopo.module.css";

function lerUsuario() {
  try {
    return JSON.parse(localStorage.getItem("usuario")) ?? {};
  } catch {
    return {};
  }
}

export function BarraTopo() {
  const usuario = lerUsuario();
  const nome = usuario.nomePessoa || usuario.email || "Usuário";

  return (
    <header className={styles.barra}>
      <BuscaGlobal />

      <div className={styles.acoes}>
        <InterruptorTema />

        <div className={styles.usuario} title={usuario.email}>
          <div className={styles.usuarioTextos}>
            <span className={styles.usuarioNome}>{nome}</span>
            {usuario.nomeCargo && (
              <span className={styles.usuarioCargo}>{usuario.nomeCargo}</span>
            )}
          </div>
          <Avatar nome={nome} tamanho={36} />
        </div>
      </div>
    </header>
  );
}

export default BarraTopo;
