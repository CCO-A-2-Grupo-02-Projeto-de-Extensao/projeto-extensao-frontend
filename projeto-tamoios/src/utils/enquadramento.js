// 50/50 é o centro (mesmo padrão de object-position) e zoom 1 é a imagem
// apenas cobrindo o círculo — ou seja, o comportamento de object-fit: cover.
export const ENQUADRAMENTO_PADRAO = { posX: 50, posY: 50, zoom: 1 };

export function normalizarEnquadramento(origem) {
  return {
    posX: origem?.posX ?? ENQUADRAMENTO_PADRAO.posX,
    posY: origem?.posY ?? ENQUADRAMENTO_PADRAO.posY,
    zoom: origem?.zoom ?? ENQUADRAMENTO_PADRAO.zoom,
  };
}
