import { useSyncExternalStore } from "react";
import { assinarTema, lerPreferenciaTema, lerTema } from "../utils/tema.js";

// O tema que está pintado na tela (claro ou escuro), já com "sistema"
// resolvido. Quem só precisa saber se está escuro usa este.
export function useTema() {
  return useSyncExternalStore(assinarTema, lerTema);
}

// A escolha gravada, que pode ser "sistema" — para o painel de configurações
// marcar a opção certa.
export function usePreferenciaTema() {
  return useSyncExternalStore(assinarTema, lerPreferenciaTema);
}
