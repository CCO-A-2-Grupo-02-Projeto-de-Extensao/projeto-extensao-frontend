import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import { BuscaGlobal } from "../BuscaGlobal/BuscaGlobal.jsx";
import { Avatar } from "../Avatar/Avatar.jsx";
import { aplicarTema, lerTema } from "../../utils/tema.js";
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
  const [tema, setTema] = useState(lerTema);
  const escuro = tema === "escuro";
  const transicao = useRef(null);

  function alternarTema(evento) {
    const novo = escuro ? "claro" : "escuro";
    const trocar = () =>
      flushSync(() => {
        aplicarTema(novo);
        setTema(novo);
      });

    const semAnimacao = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (!document.startViewTransition || semAnimacao) {
      trocar();
      return;
    }

    const botao = evento.currentTarget;
    const { left, top, width, height } = botao.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const raio = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const raiz = document.documentElement;
    raiz.style.setProperty("--origemX", `${x}px`);
    raiz.style.setProperty("--origemY", `${y}px`);
    raiz.style.setProperty("--raioRevelacao", `${raio}px`);

    transicao.current?.skipTransition();
    transicao.current = document.startViewTransition(trocar);

    const repassarClique = (e) => {
      const r = botao.getBoundingClientRect();
      const sobreBotao =
        e.clientX >= r.left &&
        e.clientX <= r.right &&
        e.clientY >= r.top &&
        e.clientY <= r.bottom;
      if (e.target === raiz && sobreBotao) botao.click();
    };
    raiz.addEventListener("click", repassarClique);
    transicao.current.finished.finally(() =>
      raiz.removeEventListener("click", repassarClique)
    );
  }

  return (
    <header className={styles.barra}>
      <BuscaGlobal />

      <div className={styles.acoes}>
        <button
          type="button"
          role="switch"
          aria-checked={escuro}
          aria-label="Modo escuro"
          title={escuro ? "Mudar para o modo claro" : "Mudar para o modo escuro"}
          className={styles.interruptor}
          onClick={alternarTema}
        >
          <span className={styles.pino}>
            <LightModeOutlinedIcon className={styles.iconeSol} />
            <DarkModeOutlinedIcon className={styles.iconeLua} />
          </span>
        </button>

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
