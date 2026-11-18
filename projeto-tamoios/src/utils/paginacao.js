// Quantas páginas aparecem de cada lado da atual. Com a primeira, a última e
// as reticências, a barra nunca passa de 2 * VIZINHOS + 5 posições — por isso
// mil usuários cadastrados não viram mil botões espremidos na tela.
export const VIZINHOS = 1;
export const ELIPSE = "elipse";

const intervalo = (de, ate) =>
  Array.from({ length: Math.max(0, ate - de + 1) }, (_, i) => de + i);

/**
 * Monta a janela de páginas visíveis: sempre a primeira, sempre a última, a
 * atual com seus vizinhos e reticências no lugar do que foi omitido.
 * Devolve números de página e marcadores ELIPSE, sempre na mesma quantidade
 * de posições, para a barra não mudar de largura ao navegar.
 */
export function montarPaginas(paginaAtual, totalPaginas, vizinhos = VIZINHOS) {
  const posicoes = 2 * vizinhos + 5;
  if (totalPaginas <= posicoes) return intervalo(1, totalPaginas);

  const esquerda = Math.max(paginaAtual - vizinhos, 1);
  const direita = Math.min(paginaAtual + vizinhos, totalPaginas);
  const cortaInicio = esquerda > 2;
  const cortaFim = direita < totalPaginas - 1;
  const quantas = 3 + 2 * vizinhos;

  if (!cortaInicio) return [...intervalo(1, quantas), ELIPSE, totalPaginas];
  if (!cortaFim)
    return [1, ELIPSE, ...intervalo(totalPaginas - quantas + 1, totalPaginas)];

  return [1, ELIPSE, ...intervalo(esquerda, direita), ELIPSE, totalPaginas];
}

export default montarPaginas;
