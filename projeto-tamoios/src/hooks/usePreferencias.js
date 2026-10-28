import { useSyncExternalStore } from "react";
import { assinarPreferencias, lerPreferencias } from "../utils/preferencias.js";

// Lê as preferências salvas e re-renderiza quem usa quando o painel de
// configurações grava uma mudança.
export function usePreferencias() {
  return useSyncExternalStore(assinarPreferencias, lerPreferencias);
}

export default usePreferencias;
