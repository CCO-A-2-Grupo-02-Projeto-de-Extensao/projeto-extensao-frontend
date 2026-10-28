const CHAVE = "tema";
const EVENTO = "tema:mudou";
const TEMAS = ["claro", "escuro", "sistema"];

function consultaEscuro() {
  return window.matchMedia?.("(prefers-color-scheme: dark)");
}

export function lerPreferenciaTema() {
  try {
    const salvo = localStorage.getItem(CHAVE);
    return TEMAS.includes(salvo) ? salvo : "claro";
  } catch {
    return "claro";
  }
}

// O resto do app raciocina só em claro/escuro — "sistema" é resolvido aqui
// para o tema que está valendo no momento.
export function lerTema() {
  const preferencia = lerPreferenciaTema();
  if (preferencia !== "sistema") return preferencia;
  return consultaEscuro()?.matches ? "escuro" : "claro";
}

export function aplicarTema(tema) {
  const preferencia = TEMAS.includes(tema) ? tema : "claro";
  const efetivo =
    preferencia === "sistema"
      ? consultaEscuro()?.matches
        ? "escuro"
        : "claro"
      : preferencia;

  document.documentElement.dataset.tema = efetivo;

  try {
    localStorage.setItem(CHAVE, preferencia);
  } catch {
    // Aba anônima ou armazenamento cheio: o tema vale para a sessão corrente.
  }

  window.dispatchEvent(new CustomEvent(EVENTO));
}

export function assinarTema(ouvinte) {
  window.addEventListener(EVENTO, ouvinte);
  return () => window.removeEventListener(EVENTO, ouvinte);
}

// Com "sistema" escolhido o tema do SO pode virar com o app já aberto, então
// alguém precisa ouvir a troca.
export function observarTemaDoSistema() {
  const consulta = consultaEscuro();
  if (!consulta) return () => {};

  const aoMudar = () => {
    if (lerPreferenciaTema() === "sistema") aplicarTema("sistema");
  };

  consulta.addEventListener("change", aoMudar);
  return () => consulta.removeEventListener("change", aoMudar);
}
