const APP = "https://vlibras.gov.br/app";
const PLUGIN = `${APP}/vlibras-plugin.js`;

// Host do shadow DOM com o botão de acesso, criado pelo plugin no `body`.
const ID_BOTAO = "vlibras-access-wrapper";
// Janela de tradução, criada só no primeiro clique do botão.
const ID_JANELA = "vlibras-app-root";

let carga = null;
let visivelDesejado = false;

/**
 * O widget nasce visível e fora da árvore do React, então a visibilidade é
 * guardada aqui e reaplicada quando o plugin termina de montar — sem isso,
 * desligar a opção durante o download não teria efeito nenhum.
 */
function aplicarVisibilidade() {
  const botao = document.getElementById(ID_BOTAO);
  if (botao) botao.style.display = visivelDesejado ? "" : "none";

  // Esconder só o botão deixaria a janela de tradução aberta sobre a tela.
  const janela = document.getElementById(ID_JANELA);
  if (janela && !visivelDesejado) janela.dataset.active = "false";
}

/**
 * Baixa o plugin e instancia o widget uma única vez. Antes isto rodava no
 * `main.jsx` em toda visita; agora só acontece quando alguém liga a opção.
 */
export function carregarVLibras() {
  if (carga) return carga;

  carga = new Promise((resolver, rejeitar) => {
    const montar = () => {
      // O construtor cria o botão de forma síncrona, então a visibilidade já
      // pode ser aplicada na sequência.
      new window.VLibras.Widget(APP);
      aplicarVisibilidade();
      resolver();
    };

    if (window.VLibras) {
      montar();
      return;
    }

    const script = document.createElement("script");
    script.src = PLUGIN;
    script.async = true;
    script.onload = montar;
    script.onerror = () => {
      // Sem limpar a promessa, uma queda de rede deixaria a opção travada
      // em erro até a página recarregar.
      carga = null;
      script.remove();
      rejeitar(new Error("Não foi possível carregar o VLibras."));
    };

    document.body.appendChild(script);
  });

  return carga;
}

export function exibirVLibras(visivel) {
  visivelDesejado = visivel;
  aplicarVisibilidade();
}
