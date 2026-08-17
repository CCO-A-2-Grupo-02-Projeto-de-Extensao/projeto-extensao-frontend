import { api } from "./api";

export const CATEGORIAS = {
  TODOS: "todos",
  ADMINISTRATIVO: "administrativo",
  INSTRUTOR: "instrutor",
  ALUNO: "aluno",
};

export const SITUACOES = {
  ATIVOS: "ativos",
  INATIVOS: "inativos",
  TODOS: "todos",
};

function paraMembro(pessoa) {
  return {
    id: pessoa.idPessoa,
    nome: pessoa.nome,
    papel: pessoa.nomeCargo,
    categoria: pessoa.categoria,
    ativo: pessoa.ativo,
    documentacao: false, // recalculado depois de carregar os documentos reais (ver documentosService)
    classe: pessoa.nomeClasse,
    idClasse: pessoa.idClasse,
    genero: pessoa.nomeGenero,
    idGenero: pessoa.idGenero,
    unidade: pessoa.nomeUnidade,
    idUnidade: pessoa.idUnidade,
    idCargo: pessoa.idCargo,
    dataNascimento: pessoa.dataNascimento,
    telefone: pessoa.telefone,
    cpf: pessoa.cpf,
    rg: pessoa.rg,
    escola: pessoa.escola,
    turma: pessoa.serieEscolar,
    isDesbravador: pessoa.isDesbravador,
    nomeResponsavel1: pessoa.nomeResponsavel1,
    telefoneResponsavel1: pessoa.telefoneResponsavel1,
    rgResponsavel1: pessoa.rgResponsavel1,
    cpfResponsavel1: pessoa.cpfResponsavel1,
    nomeResponsavel2: pessoa.nomeResponsavel2,
    telefoneResponsavel2: pessoa.telefoneResponsavel2,
    rgResponsavel2: pessoa.rgResponsavel2,
    cpfResponsavel2: pessoa.cpfResponsavel2,
  };
}

export async function getMembros() {
  const { data } = await api.get("/pessoas");
  return data.map(paraMembro);
}

// Converte o formData produzido pelo formulário (ver
// utils/desbravadorForm.jsx) — onde cargo/classe/genero/unidade guardam o id
// real como string — no formato que o backend espera em PessoaCadastroRequest.
export function construirPessoaRequest(formData) {
  return {
    nome: formData.nome?.trim(),
    dataNascimento: formData.dataNascimento,
    telefone: formData.telefone || null,
    idClasse: formData.classe ? Number(formData.classe) : null,
    idGenero: formData.genero ? Number(formData.genero) : null,
    idUnidade: formData.unidade ? Number(formData.unidade) : null,
    idCargo: formData.cargo ? Number(formData.cargo) : null,
    escola: formData.escola || null,
    serieEscolar: formData.turma || null,
    nomeResponsavel1: formData.nomeResponsavel1 || null,
    telefoneResponsavel1: formData.telefoneResponsavel1 || null,
    rgResponsavel1: formData.rgResponsavel1 || null,
    cpfResponsavel1: formData.cpfResponsavel1 || null,
    nomeResponsavel2: formData.nomeResponsavel2 || null,
    telefoneResponsavel2: formData.telefoneResponsavel2 || null,
    rgResponsavel2: formData.rgResponsavel2 || null,
    cpfResponsavel2: formData.cpfResponsavel2 || null,
  };
}

export async function criarPessoa(formData) {
  const { data } = await api.post("/pessoas", construirPessoaRequest(formData));
  return paraMembro(data);
}

export async function atualizarPessoa(idPessoa, formData) {
  const { data } = await api.put(`/pessoas/${idPessoa}`, construirPessoaRequest(formData));
  return paraMembro(data);
}

export async function desativarPessoa(idPessoa) {
  await api.patch(`/pessoas/${idPessoa}/desativar`);
}

export async function reativarPessoa(idPessoa) {
  await api.patch(`/pessoas/${idPessoa}/reativar`);
}

// Só é chamado quando o cargo escolhido tem login (Administrativo/Instrutor).
export async function criarUsuario({ idPessoa, idCargo, email, senha }) {
  const { data } = await api.post("/usuarios", { idPessoa, idCargo, email, senha });
  return data;
}
