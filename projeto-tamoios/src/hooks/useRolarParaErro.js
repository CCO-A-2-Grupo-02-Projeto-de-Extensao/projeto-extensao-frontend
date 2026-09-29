import { useEffect } from "react";

// Rola até o campo que falhou na validação e coloca o foco nele, para que o
// erro não fique fora da área visível do modal. Os campos do formulário usam
// `id={campo.name}` (ver renderCampo); erros que não pertencem a um input
// — responsáveis, falha de submissão — são marcados com `data-erro`.
export function useRolarParaErro(alvo, dependencia) {
  useEffect(() => {
    if (!alvo) return;

    const elemento =
      document.getElementById(alvo) ??
      document.querySelector(`[data-erro="${alvo}"]`);
    if (!elemento) return;

    const semAnimacao = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    elemento.scrollIntoView({
      behavior: semAnimacao ? "auto" : "smooth",
      block: "center",
    });

    // preventScroll evita um segundo salto por cima do scrollIntoView acima
    elemento.focus?.({ preventScroll: true });
  }, [alvo, dependencia]);
}
