const CHAVE = "acessibilidade";

// A tipografia do app é escrita em px, então aumentar o `font-size` da raiz não
// mexeria em nada. A escala vira `zoom` no `<html>` (ver index.css), que é o
// único jeito de ampliar um layout em px sem reescrever a folha de estilo.
export const ESCALAS = [0.9, 1, 1.15, 1.3, 1.45];

export const PADRAO_ACESSIBILIDADE = {
  vlibras: false,
  escala: 1,
  contraste: false,
  movimentoReduzido: false,
};

export function lerAcessibilidade() {
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE) ?? "null");
    return salvo ? { ...PADRAO_ACESSIBILIDADE, ...salvo } : { ...PADRAO_ACESSIBILIDADE };
  } catch {
    return { ...PADRAO_ACESSIBILIDADE };
  }
}

export function aplicarAcessibilidade(preferencias) {
  const raiz = document.documentElement;

  raiz.style.setProperty("--escalaConteudo", preferencias.escala);
  raiz.dataset.contraste = preferencias.contraste ? "alto" : "normal";
  raiz.dataset.movimento = preferencias.movimentoReduzido ? "reduzido" : "livre";

  try {
    localStorage.setItem(CHAVE, JSON.stringify(preferencias));
  } catch {
    return;
  }
}
