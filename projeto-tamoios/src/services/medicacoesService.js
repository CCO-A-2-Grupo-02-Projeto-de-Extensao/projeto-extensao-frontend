import { api } from "./api";
import { enviarDocumento, removerDocumento } from "./documentosService";

export const TIPO_RECEITA = "receitaMedicacao";

export const DIAS_SEMANA = [
  { id: "SEG", rotulo: "Seg" },
  { id: "TER", rotulo: "Ter" },
  { id: "QUA", rotulo: "Qua" },
  { id: "QUI", rotulo: "Qui" },
  { id: "SEX", rotulo: "Sex" },
  { id: "SAB", rotulo: "Sáb" },
  { id: "DOM", rotulo: "Dom" },
];

export const UNIDADES_DOSE = ["mg", "ml", "gotas", "comprimido(s)", "cápsula(s)", "jato(s)", "UI"];

const separar = (valor) => (valor ? valor.split(",") : []);

function paraMedicacao(resposta) {
  return {
    id: resposta.id,
    nome: resposta.nomeMedicamento,
    dose: resposta.dose != null ? String(Number(resposta.dose)) : "",
    unidadeDose: resposta.unidadeDose ?? "",
    dias: separar(resposta.diasSemana),
    horarios: separar(resposta.horarios),
    inicio: resposta.horarioInicio?.slice(0, 10) ?? "",
    fim: resposta.horarioFim?.slice(0, 10) ?? "",
    observacoes: resposta.observacoes ?? "",
    receita: resposta.idDocumento
      ? { idDocumento: resposta.idDocumento, nome: resposta.nomeDocumento }
      : null,
  };
}

async function buscarFicha(idPessoa) {
  try {
    const { data } = await api.get(`/fichas-medicas/pessoa/${idPessoa}`);
    return data;
  } catch (erro) {
    if (erro.response?.status === 404) return null;
    throw erro;
  }
}

async function idFichaDaPessoa(idPessoa) {
  const ficha = await buscarFicha(idPessoa);
  if (ficha) return ficha.id;
  const { data } = await api.post("/fichas-medicas", { idPessoa });
  return data.id;
}

export async function listarNomesMedicamentos() {
  const { data } = await api.get("/medicamentos");
  return data.map((medicamento) => medicamento.nome);
}

async function idMedicamentoPorNome(nome) {
  const { data } = await api.get("/medicamentos");
  const procurado = nome.trim().toLocaleLowerCase("pt-BR");
  const existente = data.find(
    (medicamento) => medicamento.nome.trim().toLocaleLowerCase("pt-BR") === procurado
  );
  if (existente) return existente.id;
  const { data: novo } = await api.post("/medicamentos", { nome: nome.trim() });
  return novo.id;
}

export async function listarMedicacoesDaPessoa(idPessoa) {
  const ficha = await buscarFicha(idPessoa);
  return ficha ? ficha.medicacoes.map(paraMedicacao) : [];
}

export async function salvarMedicacao(idPessoa, medicacao, arquivoReceita, receitaAnterior) {
  const [idFichaMedica, idMedicamento] = await Promise.all([
    medicacao.id ? null : idFichaDaPessoa(idPessoa),
    idMedicamentoPorNome(medicacao.nome),
  ]);

  const receita = arquivoReceita
    ? await enviarDocumento(idPessoa, TIPO_RECEITA, arquivoReceita)
    : medicacao.receita;

  const corpo = {
    idMedicamento,
    idDocumento: receita?.idDocumento ?? null,
    dose: medicacao.dose === "" ? null : Number(medicacao.dose),
    unidadeDose: medicacao.unidadeDose || null,
    diasSemana: medicacao.dias.join(",") || null,
    horarios: medicacao.horarios.filter(Boolean).join(",") || null,
    horarioInicio: medicacao.inicio ? `${medicacao.inicio}T00:00:00` : null,
    horarioFim: medicacao.fim ? `${medicacao.fim}T00:00:00` : null,
    observacoes: medicacao.observacoes.trim() || null,
  };

  const { data } = medicacao.id
    ? await api.put(`/medicacoes/${medicacao.id}`, corpo)
    : await api.post("/medicacoes", { ...corpo, idFichaMedica });

  if (receitaAnterior && receitaAnterior.idDocumento !== corpo.idDocumento) {
    await removerDocumento(receitaAnterior.idDocumento);
  }

  return paraMedicacao(data);
}

export async function removerMedicacao(medicacao) {
  await api.delete(`/medicacoes/${medicacao.id}`);
  if (medicacao.receita) await removerDocumento(medicacao.receita.idDocumento);
}
