import { api } from "./api";

export async function listarOcorrenciasDaPessoa(idPessoa) {
  const { data } = await api.get(`/ocorrencias/pessoa/${idPessoa}`);
  return data.map((o) => ({ id: o.id, data: o.data, descricao: o.descricao }));
}

export async function registrarOcorrencia(idPessoa, data, descricao) {
  const { data: criada } = await api.post("/ocorrencias", {
    idPessoa,
    data,
    descricao,
  });
  return { id: criada.id, data: criada.data, descricao: criada.descricao };
}

export async function removerOcorrencia(idOcorrencia) {
  await api.delete(`/ocorrencias/${idOcorrencia}`);
}
