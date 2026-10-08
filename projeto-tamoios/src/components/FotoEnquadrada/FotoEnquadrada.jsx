import { useEffect, useRef, useState } from "react";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import styles from "../../styles/fotoEnquadrada.module.css";
import {
  ENQUADRAMENTO_PADRAO,
  normalizarEnquadramento,
} from "../../utils/enquadramento.js";

const ZOOM_MIN = 1;
const ZOOM_MAX = 4;
const PASSO_TECLADO = 3;

const limitar = (valor, min, max) => Math.min(max, Math.max(min, valor));

/**
 * Mostra a imagem recortada em círculo. Passando `onChange`, o círculo fica
 * arrastável e ganha controle de zoom — é o mesmo componente nos dois modos,
 * então o que se ajusta é exatamente o que se vê depois.
 */
export function FotoEnquadrada({ url, alt, enquadramento, onChange, tamanho }) {
  const ajustavel = typeof onChange === "function";
  const { posX, posY, zoom } = normalizarEnquadramento(enquadramento);

  const containerRef = useRef(null);
  const arrasteRef = useRef(null);
  const [natural, setNatural] = useState(null);
  const [caixa, setCaixa] = useState(null);

  // O ResizeObserver já dispara uma vez ao observar, então não é preciso
  // medir de forma síncrona aqui.
  useEffect(() => {
    const elemento = containerRef.current;
    if (!elemento) return undefined;

    const observador = new ResizeObserver(([entrada]) => {
      const { width, height } = entrada.contentRect;
      setCaixa({ largura: width, altura: height });
    });
    observador.observe(elemento);

    return () => observador.disconnect();
  }, []);

  // Quanto a imagem sobra para cada lado depois de cobrir o círculo: é essa
  // sobra que o arraste percorre, o que dá um movimento 1:1 com o cursor.
  const sobras = () => {
    if (!natural || !caixa) return null;
    const base = Math.max(caixa.largura / natural.largura, caixa.altura / natural.altura);
    const largura = natural.largura * base * zoom;
    const altura = natural.altura * base * zoom;
    return {
      largura,
      altura,
      x: largura - caixa.largura,
      y: altura - caixa.altura,
    };
  };

  const medidas = sobras();

  const aoPressionar = (evento) => {
    if (!ajustavel || !medidas) return;
    evento.currentTarget.setPointerCapture(evento.pointerId);
    arrasteRef.current = { x: evento.clientX, y: evento.clientY, posX, posY };
  };

  const aoMover = (evento) => {
    const inicio = arrasteRef.current;
    if (!inicio || !medidas) return;

    const deslocamentoX = evento.clientX - inicio.x;
    const deslocamentoY = evento.clientY - inicio.y;

    onChange({
      // Sem sobra no eixo não há o que deslocar; manter 50 evita que o valor
      // fique preso num extremo ao dar zoom depois.
      posX:
        medidas.x > 0
          ? limitar(inicio.posX - (deslocamentoX / medidas.x) * 100, 0, 100)
          : ENQUADRAMENTO_PADRAO.posX,
      posY:
        medidas.y > 0
          ? limitar(inicio.posY - (deslocamentoY / medidas.y) * 100, 0, 100)
          : ENQUADRAMENTO_PADRAO.posY,
      zoom,
    });
  };

  const aoSoltar = () => {
    arrasteRef.current = null;
  };

  const aoTeclar = (evento) => {
    if (!ajustavel) return;
    const passos = {
      ArrowLeft: { x: -PASSO_TECLADO, y: 0 },
      ArrowRight: { x: PASSO_TECLADO, y: 0 },
      ArrowUp: { x: 0, y: -PASSO_TECLADO },
      ArrowDown: { x: 0, y: PASSO_TECLADO },
    };
    const passo = passos[evento.key];
    if (!passo) return;

    evento.preventDefault();
    onChange({
      posX: limitar(posX + passo.x, 0, 100),
      posY: limitar(posY + passo.y, 0, 100),
      zoom,
    });
  };

  const estiloImagem = medidas
    ? {
        width: `${medidas.largura}px`,
        height: `${medidas.altura}px`,
        left: `${-medidas.x * (posX / 100)}px`,
        top: `${-medidas.y * (posY / 100)}px`,
      }
    // Enquanto as medidas não chegam, o cover do CSS já dá o enquadramento
    // central, então não há salto perceptível.
    : { width: "100%", height: "100%", left: 0, top: 0, objectFit: "cover" };

  const estiloContainer = tamanho
    ? { width: `${tamanho}px`, height: `${tamanho}px` }
    : undefined;

  return (
    <div className={styles.area}>
      <div
        ref={containerRef}
        className={`${styles.circulo} ${ajustavel ? styles.ajustavel : ""}`}
        style={estiloContainer}
        onPointerDown={aoPressionar}
        onPointerMove={aoMover}
        onPointerUp={aoSoltar}
        onPointerCancel={aoSoltar}
        onKeyDown={aoTeclar}
        role={ajustavel ? "application" : undefined}
        tabIndex={ajustavel ? 0 : undefined}
        aria-label={
          ajustavel ? "Arraste para reposicionar a foto, ou use as setas" : undefined
        }
      >
        <img
          src={url}
          alt={alt}
          className={styles.imagem}
          style={estiloImagem}
          draggable={false}
          onLoad={(evento) =>
            setNatural({
              largura: evento.currentTarget.naturalWidth,
              altura: evento.currentTarget.naturalHeight,
            })
          }
        />
      </div>

      {ajustavel && (
        <label className={styles.controleZoom}>
          <ZoomOutIcon fontSize="small" className={styles.iconeZoom} />
          <input
            type="range"
            min={ZOOM_MIN}
            max={ZOOM_MAX}
            step={0.05}
            value={zoom}
            onChange={(evento) =>
              onChange({ posX, posY, zoom: Number(evento.target.value) })
            }
            aria-label="Zoom da foto"
          />
          <ZoomInIcon fontSize="small" className={styles.iconeZoom} />
        </label>
      )}
    </div>
  );
}

export default FotoEnquadrada;
