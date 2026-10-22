import { useEffect, useRef, useState } from "react";
import AccessibilityNewIcon from "@mui/icons-material/AccessibilityNew";
import CloseIcon from "@mui/icons-material/Close";
import ContrastIcon from "@mui/icons-material/Contrast";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SignLanguageIcon from "@mui/icons-material/SignLanguage";
import SlowMotionVideoIcon from "@mui/icons-material/SlowMotionVideo";
import TextDecreaseIcon from "@mui/icons-material/TextDecrease";
import TextIncreaseIcon from "@mui/icons-material/TextIncrease";
import { Tooltip } from "@mui/material";

import {
  ESCALAS,
  PADRAO_ACESSIBILIDADE,
  aplicarAcessibilidade,
  lerAcessibilidade,
} from "../../utils/acessibilidade.js";
import { carregarVLibras, exibirVLibras } from "../../utils/vlibras.js";
import styles from "../../styles/menuAcessibilidade.module.css";

const ERRO_VLIBRAS = "Não foi possível carregar o VLibras. Verifique a conexão.";

export function MenuAcessibilidade() {
  const [aberto, setAberto] = useState(false);
  const [preferencias, setPreferencias] = useState(lerAcessibilidade);
  const [erroVLibras, setErroVLibras] = useState("");
  const area = useRef(null);

  const indiceEscala = ESCALAS.indexOf(preferencias.escala);
  const posicaoEscala = indiceEscala === -1 ? ESCALAS.indexOf(1) : indiceEscala;
  const padrao =
    preferencias.escala === PADRAO_ACESSIBILIDADE.escala &&
    !preferencias.contraste &&
    !preferencias.movimentoReduzido &&
    !preferencias.vlibras;

  function atualizar(mudanca) {
    setPreferencias((atuais) => {
      const novas = { ...atuais, ...mudanca };
      aplicarAcessibilidade(novas);
      return novas;
    });
  }

  // O widget é pesado e externo, então só entra quando a opção está ligada —
  // isto cobre tanto o clique quanto a preferência restaurada do localStorage.
  useEffect(() => {
    if (!preferencias.vlibras) {
      exibirVLibras(false);
      return;
    }

    let valido = true;

    carregarVLibras()
      .then(() => {
        if (valido) exibirVLibras(true);
      })
      .catch(() => {
        if (!valido) return;
        setErroVLibras(ERRO_VLIBRAS);
        // Deixar `true` gravado faria a falha se repetir a cada visita.
        setPreferencias((atuais) => {
          const revertidas = { ...atuais, vlibras: false };
          aplicarAcessibilidade(revertidas);
          return revertidas;
        });
      });

    return () => {
      valido = false;
    };
  }, [preferencias.vlibras]);

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

  const interruptores = [
    {
      chave: "vlibras",
      rotulo: "Tradutor de Libras",
      descricao: "Abre o VLibras para traduzir o conteúdo da tela.",
      icone: <SignLanguageIcon fontSize="small" />,
      ativo: preferencias.vlibras,
      alternar: () => {
        setErroVLibras("");
        atualizar({ vlibras: !preferencias.vlibras });
      },
    },
    {
      chave: "contraste",
      rotulo: "Alto contraste",
      descricao: "Reforça bordas e escurece os textos.",
      icone: <ContrastIcon fontSize="small" />,
      ativo: preferencias.contraste,
      alternar: () => atualizar({ contraste: !preferencias.contraste }),
    },
    {
      chave: "movimento",
      rotulo: "Reduzir animações",
      descricao: "Desliga transições e efeitos de movimento.",
      icone: <SlowMotionVideoIcon fontSize="small" />,
      ativo: preferencias.movimentoReduzido,
      alternar: () =>
        atualizar({ movimentoReduzido: !preferencias.movimentoReduzido }),
    },
  ];

  return (
    <div className={styles.area} ref={area}>
      <Tooltip arrow placement="bottom" title="Opções de acessibilidade">
        <button
          type="button"
          className={styles.botao}
          onClick={() => setAberto((estava) => !estava)}
          aria-expanded={aberto}
          aria-haspopup="dialog"
          aria-label="Opções de acessibilidade"
        >
          <AccessibilityNewIcon fontSize="small" />
        </button>
      </Tooltip>

      {aberto && (
        <div
          className={styles.painel}
          role="dialog"
          aria-label="Opções de acessibilidade"
        >
          <header className={styles.cabecalho}>
            <h2 className={styles.titulo}>Acessibilidade</h2>
            <button
              type="button"
              className={styles.botaoFechar}
              onClick={() => setAberto(false)}
              title="Fechar"
              aria-label="Fechar opções de acessibilidade"
            >
              <CloseIcon fontSize="small" />
            </button>
          </header>

          <div className={styles.grupo}>
            <div className={styles.grupoTextos}>
              <span className={styles.rotulo}>Tamanho do conteúdo</span>
              <span className={styles.descricao}>
                {Math.round(preferencias.escala * 100)}% do tamanho original.
              </span>
            </div>

            <div className={styles.controleEscala}>
              <button
                type="button"
                className={styles.botaoEscala}
                onClick={() => atualizar({ escala: ESCALAS[posicaoEscala - 1] })}
                disabled={posicaoEscala === 0}
                title="Diminuir"
                aria-label="Diminuir o tamanho do conteúdo"
              >
                <TextDecreaseIcon fontSize="small" />
              </button>
              <button
                type="button"
                className={styles.botaoEscala}
                onClick={() => atualizar({ escala: ESCALAS[posicaoEscala + 1] })}
                disabled={posicaoEscala === ESCALAS.length - 1}
                title="Aumentar"
                aria-label="Aumentar o tamanho do conteúdo"
              >
                <TextIncreaseIcon fontSize="small" />
              </button>
            </div>
          </div>

          {interruptores.map(
            ({ chave, rotulo, descricao, icone, ativo, alternar }) => (
              <button
                key={chave}
                type="button"
                role="switch"
                aria-checked={ativo}
                className={`${styles.opcao} ${ativo ? styles.opcaoAtiva : ""}`}
                onClick={alternar}
              >
                <span className={styles.opcaoIcone}>{icone}</span>
                <span className={styles.grupoTextos}>
                  <span className={styles.rotulo}>{rotulo}</span>
                  <span className={styles.descricao}>{descricao}</span>
                </span>
                <span className={styles.interruptor} aria-hidden="true">
                  <span className={styles.pino} />
                </span>
              </button>
            )
          )}

          {erroVLibras && <p className={styles.erro}>{erroVLibras}</p>}

          <button
            type="button"
            className={styles.botaoRestaurar}
            onClick={() => {
              setErroVLibras("");
              atualizar(PADRAO_ACESSIBILIDADE);
            }}
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

export default MenuAcessibilidade;
