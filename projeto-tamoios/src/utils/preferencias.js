import { itensNavegacao } from "./navegacao.js";

const CHAVE = "preferencias";
const EVENTO = "preferencias:mudou";

export const TAMANHOS_PAGINA = [10, 15, 25, 50];

export const PADRAO_PREFERENCIAS = {
  paginaInicial: "/dashboard",
  itensPorPagina: 10,
  confirmarSaida: true,
};

function daMemoria() {
  try {
    const salvas = JSON.parse(localStorage.getItem(CHAVE) ?? "null");
    if (!salvas) return { ...PADRAO_PREFERENCIAS };
    const juntas = { ...PADRAO_PREFERENCIAS, ...salvas };

    // Uma rota removida do menu continuaria salva e levaria a uma tela em
    // branco no login seguinte.
    const rotaValida = itensNavegacao.some(
      ({ path }) => path === juntas.paginaInicial
    );
    if (!rotaValida) juntas.paginaInicial = PADRAO_PREFERENCIAS.paginaInicial;
    if (!TAMANHOS_PAGINA.includes(juntas.itensPorPagina)) {
      juntas.itensPorPagina = PADRAO_PREFERENCIAS.itensPorPagina;
    }

    return juntas;
  } catch {
    return { ...PADRAO_PREFERENCIAS };
  }
}

// `useSyncExternalStore` compara os retornos por identidade, então o objeto
// precisa ser o mesmo enquanto nada mudar.
let atuais = null;

export function lerPreferencias() {
  if (!atuais) atuais = daMemoria();
  return atuais;
}

export function salvarPreferencias(preferencias) {
  atuais = { ...PADRAO_PREFERENCIAS, ...preferencias };

  try {
    localStorage.setItem(CHAVE, JSON.stringify(atuais));
  } catch {
    // Sem espaço ou em aba anônima: a sessão corrente ainda respeita a escolha.
  }

  window.dispatchEvent(new CustomEvent(EVENTO));
}

export function assinarPreferencias(ouvinte) {
  window.addEventListener(EVENTO, ouvinte);
  return () => window.removeEventListener(EVENTO, ouvinte);
}
