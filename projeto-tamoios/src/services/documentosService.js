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
  };
}

export async function removerDocumento(idDocumento) {
  await api.delete(`/documentos/${idDocumento}`);
}
