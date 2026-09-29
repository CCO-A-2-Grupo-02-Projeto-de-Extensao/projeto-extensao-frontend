import { useRef } from "react";

// Devolve os handlers do overlay para fechar o modal ao clicar no fundo.
// Só fecha quando o clique nasce E termina no próprio overlay: sem isso, uma
// seleção de texto iniciada dentro do modal e solta no fundo fecharia tudo.
export function useFecharAoClicarFora(onFechar) {
  const comecouNoFundo = useRef(false);

  return {
    onMouseDown: (evento) => {
      comecouNoFundo.current = evento.target === evento.currentTarget;
    },
    onClick: (evento) => {
      if (comecouNoFundo.current && evento.target === evento.currentTarget) {
        onFechar?.();
      }
      comecouNoFundo.current = false;
    },
  };
}
