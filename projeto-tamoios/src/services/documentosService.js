import { api } from "./api";

function urlVisualizar(idDocumento) {
  const base = api.defaults.baseURL ?? "";
  return `${base}/documentos/${idDocumento}/visualizar`;
}

// Converte a lista de DocumentoResponse da API pro formato
// `{ [tipo]: { nome, tamanho, tipo, url } }` que os componentes já consomem
// (DocumentCard, grid de documentos dos modais de detalhes/edição/cadastro).
export function paraMapaPorTipo(documentos) {
  const mapa = {};
  for (const doc of documentos) {
    if (!doc.tipo) continue;
    mapa[doc.tipo] = {
      idDocumento: doc.id,
      nome: doc.nomeOriginal,
      tamanho: doc.tamanho,
      tipo: doc.mimeType,
      url: urlVisualizar(doc.id),
      // Nulos em documentos nunca ajustados; quem renderiza aplica o padrão.
      posX: doc.posX,
      posY: doc.posY,
      zoom: doc.zoom,
    };
  }
  return mapa;
}

export async function listarDocumentosDaPessoa(idPessoa) {
  const { data } = await api.get(`/documentos/pessoa/${idPessoa}`);
  return paraMapaPorTipo(data);
}

export async function enviarDocumento(idPessoa, tipo, arquivo) {
  const formData = new FormData();
  formData.append("arquivo", arquivo);
  formData.append("idPessoa", idPessoa);
  formData.append("tipo", tipo);

  const { data } = await api.post("/documentos", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return {
    idDocumento: data.id,
    nome: data.nomeOriginal,
    tamanho: data.tamanho,
    tipo: data.mimeType,
    url: urlVisualizar(data.id),
    posX: data.posX,
    posY: data.posY,
    zoom: data.zoom,
  };
}

export async function substituirDocumento(idDocumento, arquivo) {
  const formData = new FormData();
  formData.append("arquivo", arquivo);

  const { data } = await api.put(`/documentos/${idDocumento}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return {
    idDocumento: data.id,
    nome: data.nomeOriginal,
    tamanho: data.tamanho,
    tipo: data.mimeType,
    url: urlVisualizar(data.id),
    posX: data.posX,
    posY: data.posY,
    zoom: data.zoom,
  };
}

export async function removerDocumento(idDocumento) {
  await api.delete(`/documentos/${idDocumento}`);
}

// Posição e zoom com que a imagem é recortada no avatar. Não altera o
// arquivo: só os metadados, então o original segue intacto e dá para
// reajustar quantas vezes quiser.
export async function salvarEnquadramento(idDocumento, { posX, posY, zoom }) {
  const { data } = await api.patch(`/documentos/${idDocumento}/enquadramento`, {
    posX,
    posY,
    zoom,
  });
  return data;
}

// /documentos/{id}/visualizar exige JWT, mas <img src> e window.open são
// requisições cruas do navegador: não passam pelo interceptor do axios e
// chegam sem o header Authorization, levando 401. Então baixamos o arquivo
// pelo axios (que injeta o token) e devolvemos um object URL, que o
// navegador renderiza/abre sem precisar autenticar.
// Quem chama é responsável por revogar o URL (URL.revokeObjectURL).
export async function urlLocalDoDocumento(idDocumento) {
  const { data } = await api.get(`/documentos/${idDocumento}/visualizar`, {
    responseType: "blob",
  });
  return URL.createObjectURL(data);
}
