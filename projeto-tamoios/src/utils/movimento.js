export function prefereMenosMovimento() {
  // A escolha feita no painel de acessibilidade vence a do sistema: quem liga a
  // opção à mão quer menos movimento mesmo que o SO não peça.
  if (document.documentElement.dataset.movimento === "reduzido") return true;

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
