import { useEffect, useRef, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import ComputerIcon from "@mui/icons-material/Computer";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SettingsIcon from "@mui/icons-material/Settings";
import { Tooltip } from "@mui/material";

import { Avatar } from "../Avatar/Avatar.jsx";
import { itensNavegacao } from "../../utils/navegacao.js";
import {
  PADRAO_PREFERENCIAS,
  TAMANHOS_PAGINA,
  salvarPreferencias,
} from "../../utils/preferencias.js";
import { usePreferencias } from "../../hooks/usePreferencias.js";
import { aplicarTema } from "../../utils/tema.js";
import { usePreferenciaTema } from "../../hooks/useTema.js";
import styles from "../../styles/menuConfiguracoes.module.css";

const OPCOES_TEMA = [
  { valor: "claro", rotulo: "Claro", icone: <LightModeOutlinedIcon fontSize="small" /> },
  { valor: "escuro", rotulo: "Escuro", icone: <DarkModeOutlinedIcon fontSize="small" /> },
  { valor: "sistema", rotulo: "Sistema", icone: <ComputerIcon fontSize="small" /> },
];

function lerUsuario() {
  try {
    return JSON.parse(localStorage.getItem("usuario")) ?? {};
  } catch {
    return {};
  }
}

export function MenuConfiguracoes() {
  const [aberto, setAberto] = useState(false);
  const preferencias = usePreferencias();
  const tema = usePreferenciaTema();
  const area = useRef(null);

  const usuario = lerUsuario();
  const nome = usuario.nomePessoa || usuario.email || "Usuário";
  const padrao =
    tema === "claro" &&
    preferencias.paginaInicial === PADRAO_PREFERENCIAS.paginaInicial &&
    preferencias.itensPorPagina === PADRAO_PREFERENCIAS.itensPorPagina &&
    preferencias.confirmarSaida === PADRAO_PREFERENCIAS.confirmarSaida;

  function atualizar(mudanca) {
    salvarPreferencias({ ...preferencias, ...mudanca });
  }

  function restaurar() {
    aplicarTema("claro");
    salvarPreferencias(PADRAO_PREFERENCIAS);
  }

  useEffect(() => {
    if (!aberto) return;

    const aoTeclar = (evento) => {
      if (evento.key === "Escape") setAberto(false);
    };
    const aoApontarFora = (evento) => {
      if (!area.current?.contains(evento.target)) setAberto(false);
    };

    document.addEventListener("keydown", aoTeclar);
    document.addEventListener("mousedown", aoApontarFora);

    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.removeEventListener("mousedown", aoApontarFora);
    };
  }, [aberto]);

  return (
    <div className={styles.area} ref={area}>
      <Tooltip arrow placement="bottom" title="Configurações">
        <button
          type="button"
          className={styles.botao}
          onClick={() => setAberto((estava) => !estava)}
          aria-expanded={aberto}
          aria-haspopup="dialog"
          aria-label="Configurações"
        >
          <SettingsIcon fontSize="small" />
        </button>
      </Tooltip>

      {aberto && (
        <div className={styles.painel} role="dialog" aria-label="Configurações">
          <header className={styles.cabecalho}>
            <h2 className={styles.titulo}>Configurações</h2>
            <button
              type="button"
              className={styles.botaoFechar}
              onClick={() => setAberto(false)}
              title="Fechar"
              aria-label="Fechar configurações"
            >
              <CloseIcon fontSize="small" />
            </button>
          </header>

          <div className={styles.conta}>
            <Avatar nome={nome} tamanho={40} />
            <span className={styles.grupoTextos}>
              <span className={styles.rotulo}>{nome}</span>
              <span className={styles.descricao}>{usuario.email}</span>
              {usuario.nomeCargo && (
                <span className={styles.cargo}>{usuario.nomeCargo}</span>
              )}
            </span>
          </div>

          <div className={styles.grupo}>
            <span className={styles.rotulo}>Tema</span>
            <div className={styles.segmentado} role="radiogroup" aria-label="Tema">
              {OPCOES_TEMA.map(({ valor, rotulo, icone }) => (
                <button
                  key={valor}
                  type="button"
                  role="radio"
                  aria-checked={tema === valor}
                  className={`${styles.segmento} ${
                    tema === valor ? styles.segmentoAtivo : ""
                  }`}
                  onClick={() => aplicarTema(valor)}
                >
                  {icone}
                  {rotulo}
                </button>
              ))}
            </div>
          </div>

          <label className={styles.grupo}>
            <span className={styles.grupoTextos}>
              <span className={styles.rotulo}>Tela inicial</span>
              <span className={styles.descricao}>
                Para onde o login leva você.
              </span>
            </span>
            <select
              className={styles.select}
              value={preferencias.paginaInicial}
              onChange={(e) => atualizar({ paginaInicial: e.target.value })}
            >
              {itensNavegacao.map(({ texto, path }) => (
                <option key={path} value={path}>
                  {texto}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.grupo}>
            <span className={styles.grupoTextos}>
              <span className={styles.rotulo}>Itens por página</span>
              <span className={styles.descricao}>
                Linhas exibidas nas listagens.
              </span>
            </span>
            <select
              className={styles.select}
              value={preferencias.itensPorPagina}
              onChange={(e) =>
                atualizar({ itensPorPagina: Number(e.target.value) })
              }
            >
              {TAMANHOS_PAGINA.map((tamanho) => (
                <option key={tamanho} value={tamanho}>
                  {tamanho}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            role="switch"
            aria-checked={preferencias.confirmarSaida}
            className={`${styles.opcao} ${
              preferencias.confirmarSaida ? styles.opcaoAtiva : ""
            }`}
            onClick={() =>
              atualizar({ confirmarSaida: !preferencias.confirmarSaida })
            }
          >
            <span className={styles.opcaoIcone}>
              <LogoutIcon fontSize="small" />
            </span>
            <span className={styles.grupoTextos}>
              <span className={styles.rotulo}>Confirmar antes de sair</span>
              <span className={styles.descricao}>
                Pergunta antes de encerrar a sessão.
              </span>
            </span>
            <span className={styles.interruptor} aria-hidden="true">
              <span className={styles.pino} />
            </span>
          </button>

          <button
            type="button"
            className={styles.botaoRestaurar}
            onClick={restaurar}
            disabled={padrao}
          >
            <RestartAltIcon fontSize="small" />
            Restaurar padrão
          </button>
        </div>
      )}
    </div>
  );
}

export default MenuConfiguracoes;
