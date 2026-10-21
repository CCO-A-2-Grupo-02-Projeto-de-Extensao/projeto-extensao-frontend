import { useEffect, useLayoutEffect, useState } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const LIMITE_RESTAURACAO_MS = 5000;

function ler(chaveTela) {
  try {
    return JSON.parse(sessionStorage.getItem(chaveTela)) ?? {};
  } catch {
    return {};
  }
}

function gravar(chaveTela, chave, valor) {
  try {
    sessionStorage.setItem(
      chaveTela,
      JSON.stringify({ ...ler(chaveTela), [chave]: valor })
    );
  } catch {
    return;
  }
}

function useTela() {
  const { key, pathname } = useLocation();
  const voltando = useNavigationType() === "POP";
  return { chaveTela: `tela:${pathname}:${key}`, voltando };
}

export function useEstadoDaTela(chave, inicial) {
  const { chaveTela, voltando } = useTela();
  const [valor, setValor] = useState(() => {
    const salvo = ler(chaveTela);
    if (!voltando || !(chave in salvo)) return inicial;
    return inicial instanceof Date ? new Date(salvo[chave]) : salvo[chave];
  });

  useEffect(() => {
    gravar(chaveTela, chave, valor);
  }, [chaveTela, chave, valor]);

  return [valor, setValor];
}

export function useRolagemDaTela() {
  const { chaveTela, voltando } = useTela();

  useLayoutEffect(() => {
    window.history.scrollRestoration = "manual";
    const alvo = voltando ? ler(chaveTela).rolagem ?? 0 : 0;
    let restaurado = false;

    const concluir = () => {
      restaurado = true;
      observador.disconnect();
      clearTimeout(limite);
    };
    const tentar = () => {
      if (restaurado) return;
      window.scrollTo(0, alvo);
      if (Math.abs(window.scrollY - alvo) < 2) concluir();
    };
    const salvar = () => {
      if (restaurado) gravar(chaveTela, "rolagem", window.scrollY);
    };

    const observador = new ResizeObserver(tentar);
    observador.observe(document.body);
    const limite = setTimeout(concluir, LIMITE_RESTAURACAO_MS);
    const interacoes = ["wheel", "touchstart", "keydown", "mousedown"];
    interacoes.forEach((evento) =>
      window.addEventListener(evento, concluir, { passive: true })
    );
    window.addEventListener("scroll", salvar, { passive: true });
    tentar();

    return () => {
      concluir();
      interacoes.forEach((evento) =>
        window.removeEventListener(evento, concluir)
      );
      window.removeEventListener("scroll", salvar);
    };
  }, [chaveTela, voltando]);
}
