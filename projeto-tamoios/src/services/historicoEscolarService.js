import { api } from "./api";
import { enviarDocumento, removerDocumento } from "./documentosService.js";

export const DOCUMENTOS_HISTORICO = {
  boletim: { id: "boletimEscolar", titulo: "Boletim escolar" },
  declaracao: { id: "declaracaoPais", titulo: "Declaração dos pais" },
};

export const ITENS_DECLARACAO = [
  { id: "obediencia", rotulo: "Obediência" },
  { id: "prestatividade", rotulo: "Prestatividade" },
  { id: "participacao", rotulo: "Participação" },
];

export const SERIES = [
  ...Array.from({ length: 9 }, (_, i) => `${i + 1}º ano`),
  "1ª série EM",
  "2ª série EM",
  "3ª série EM",
];

const paraArquivo = (id, nome) => (id ? { idDocumento: id, nome } : null);

function paraHistorico(dados) {
  return {
    id: dados.id,
    ano: dados.ano,
    serie: dados.serie ?? "",
    obediencia: dados.obediencia,
    prestatividade: dados.prestatividade,
    participacao: dados.participacao,
    boletim: paraArquivo(dados.idBoletim, dados.nomeBoletim),
    declaracao: paraArquivo(dados.idDeclaracao, dados.nomeDeclaracao),
    outroClube: dados.outroClube,
    clubeOrigem: dados.clubeOrigem ?? "",
    classeConcluidaOrigem: dados.classeConcluidaOrigem,
  };
}

const paraCorpo = (historico) => ({
  serie: historico.serie || null,
  obediencia: historico.obediencia,
  prestatividade: historico.prestatividade,
  participacao: historico.participacao,
  idBoletim: historico.boletim?.idDocumento ?? null,
  idDeclaracao: historico.declaracao?.idDocumento ?? null,
  outroClube: historico.outroClube,
  clubeOrigem: historico.clubeOrigem.trim() || null,
  classeConcluidaOrigem: historico.classeConcluidaOrigem,
});

export const boletimEntregue = (historico) => Boolean(historico?.serie && historico?.boletim);

export const declaracaoCompleta = (historico) =>
  Boolean(historico) && ITENS_DECLARACAO.every((item) => historico[item.id]);

export async function listarHistoricos(idPessoa) {
  const { data } = await api.get(`/historicos-escolares/pessoa/${idPessoa}`);
  return data.map(paraHistorico);
}

export const historicoVazio = (ano) => ({
  id: null,
  ano,
  serie: "",
  obediencia: false,
  prestatividade: false,
  participacao: false,
  boletim: null,
  declaracao: null,
  outroClube: false,
  clubeOrigem: "",
  classeConcluidaOrigem: false,
});

export async function salvarHistorico(idPessoa, historico) {
  const { data } = historico.id
    ? await api.put(`/historicos-escolares/${historico.id}`, paraCorpo(historico))
    : await api.post("/historicos-escolares", { ...paraCorpo(historico), idPessoa, ano: historico.ano });
  return paraHistorico(data);
}

export async function trocarArquivo(idPessoa, historico, campo, arquivo) {
  const novo = arquivo
    ? await enviarDocumento(idPessoa, DOCUMENTOS_HISTORICO[campo].id, arquivo)
    : null;
  const atualizado = await salvarHistorico(idPessoa, { ...historico, [campo]: novo });
  if (historico[campo]) await removerDocumento(historico[campo].idDocumento);
  return atualizado;
}

export async function removerHistorico(historico) {
  await api.delete(`/historicos-escolares/${historico.id}`);
  await Promise.all(
    [historico.boletim, historico.declaracao]
      .filter(Boolean)
      .map((arquivo) => removerDocumento(arquivo.idDocumento))
  );
}
