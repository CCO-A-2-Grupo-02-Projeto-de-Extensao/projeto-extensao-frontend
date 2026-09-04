import { api } from "./api";

// Tudo o que a tela de Classes e suas abas (Participantes, Especialidades,
// Unidades) precisam do backend. A Classe em si é catálogo somente-leitura; o
// que muda por aqui são os vínculos: pessoa->classe, classe->especialidade e
// classe->unidade (tabela Turma).

function paraClasse(catalogo) {
  return { id: catalogo.id, nome: catalogo.nome };
}

// A tabela de Participantes mostra o responsável e a unidade, que já vêm no
// PessoaResponse — nenhuma chamada extra é necessária para montar a linha.
function paraParticipante(pessoa) {
  return {
    id: pessoa.idPessoa,
    nome: pessoa.nome,
    dataNascimento: pessoa.dataNascimento,
    idGenero: pessoa.idGenero,
    unidade: pessoa.nomeUnidade,
    idUnidade: pessoa.idUnidade,
    papel: pessoa.nomeCargo,
    categoria: pessoa.categoria,
    telefoneResponsavel: pessoa.telefoneResponsavel1,
    nomeResponsavel: pessoa.nomeResponsavel1,
    ativo: pessoa.ativo,
    idClasse: pessoa.idClasse,
    classe: pessoa.nomeClasse,
  };
}

function paraEspecialidade(especialidade) {
  return {
    id: especialidade.id,
    nome: especialidade.nome,
    categoria: especialidade.categoria,
    descricao: especialidade.descricao,
    imagem: especialidade.imagem,
  };
}

function paraUnidade(unidade) {
  return {
    id: unidade.id,
    nome: unidade.nome,
    faixaEtaria: unidade.faixaEtaria,
    sexo: unidade.nomeGenero,
    idGenero: unidade.idGenero,
    conselheiro: unidade.nomeConselheiro,
    idConselheiro: unidade.idConselheiro,
    quantidadeDesbravadores: unidade.quantidadeDesbravadores ?? 0,
    inconsistencias: unidade.inconsistencias ?? [],
  };
}

export async function getClasses() {
  const { data } = await api.get("/classes");
  return data.map(paraClasse);
}

export async function getClasse(idClasse) {
  const { data } = await api.get(`/classes/${idClasse}`);
  return paraClasse(data);
}

/* ---------------------------------------------------------------- participantes */

export async function getParticipantesDaClasse(idClasse) {
  const { data } = await api.get(`/classes/${idClasse}/participantes`);
  return data.map(paraParticipante);
}

// Candidatos a entrar na classe: todo mundo que ainda não está nela. O modal de
// adicionar filtra por categoria (instrutor ou aluno) do lado do componente.
export async function getPessoasForaDaClasse(idClasse) {
  const { data } = await api.get("/pessoas");
  return data
    .map(paraParticipante)
    .filter((pessoa) => pessoa.ativo && pessoa.idClasse !== Number(idClasse));
}

// Mesma limitação do getPessoasForaDaClasse: não há endpoint de pessoas por
// unidade, então baixamos /pessoas e filtramos aqui. A unidade pode ter gente de
// outra classe, por isso não dá pra reaproveitar getParticipantesDaClasse.
export async function getDesbravadoresDaUnidade(idUnidade) {
  const { data } = await api.get("/pessoas");
  return data
    .map(paraParticipante)
    .filter(
      (pessoa) =>
        pessoa.ativo &&
        pessoa.categoria === "aluno" &&
        String(pessoa.idUnidade) === String(idUnidade)
    );
}

export async function vincularPessoaAClasse(idPessoa, idClasse) {
  const { data } = await api.patch(`/pessoas/${idPessoa}/classe`, {
    idClasse: Number(idClasse),
  });
  return paraParticipante(data);
}

// Remover da classe é desvincular, não apagar a pessoa: idClasse vira null e o
// desbravador continua cadastrado no clube.
export async function desvincularPessoaDaClasse(idPessoa) {
  const { data } = await api.patch(`/pessoas/${idPessoa}/classe`, {
    idClasse: null,
  });
  return paraParticipante(data);
}

/* --------------------------------------------------------------- especialidades */

export async function getEspecialidades() {
  const { data } = await api.get("/especialidades");
  return data.map(paraEspecialidade);
}

export async function getEspecialidadesDaClasse(idClasse) {
  const { data } = await api.get(`/classes/${idClasse}/especialidades`);
  return data.map(paraEspecialidade);
}

export async function vincularEspecialidades(idClasse, idsEspecialidades) {
  const { data } = await api.post(`/classes/${idClasse}/especialidades`, {
    idsEspecialidades,
  });
  return data.map(paraEspecialidade);
}

export async function desvincularEspecialidade(idClasse, idEspecialidade) {
  await api.delete(`/classes/${idClasse}/especialidades/${idEspecialidade}`);
}

/* --------------------------------------------------------------------- unidades */

export async function getUnidadesDaClasse(idClasse) {
  const { data } = await api.get(`/classes/${idClasse}/unidades`);
  return data.map(paraUnidade);
}

export async function getUnidadesDetalhadas() {
  const { data } = await api.get("/unidades/detalhes");
  return data.map(paraUnidade);
}

// Criar unidade e já vinculá-la à classe são duas escritas: POST /unidades cria
// o registro, POST /turmas amarra na classe. O backend não faz as duas de uma
// vez, então a ordem importa — se a segunda falhar, a unidade fica órfã.
export async function criarUnidadeNaClasse(idClasse, dados) {
  const { data: unidade } = await api.post("/unidades", {
    nome: dados.nome,
    idGenero: dados.idGenero ? Number(dados.idGenero) : null,
    faixaEtaria: dados.faixaEtaria || null,
    idConselheiro: dados.idConselheiro ? Number(dados.idConselheiro) : null,
  });

  await api.post("/turmas", {
    idClasse: Number(idClasse),
    idUnidade: unidade.id,
  });

  return paraUnidade(unidade);
}

export async function atualizarUnidade(idUnidade, dados) {
  const { data } = await api.put(`/unidades/${idUnidade}`, {
    nome: dados.nome,
    idGenero: dados.idGenero ? Number(dados.idGenero) : null,
    faixaEtaria: dados.faixaEtaria || null,
    idConselheiro: dados.idConselheiro ? Number(dados.idConselheiro) : null,
  });
  return paraUnidade(data);
}

// Apagar a unidade desvincula quem estava nela; ninguém é excluído do clube.
export async function deletarUnidade(idUnidade) {
  await api.delete(`/unidades/${idUnidade}`);
}

// Move os desbravadores selecionados para a unidade, um PATCH por pessoa — o
// backend não tem endpoint de atribuição em lote.
export async function definirUnidadeDasPessoas(idsPessoas, idUnidade) {
  await Promise.all(
    idsPessoas.map((idPessoa) =>
      api.patch(`/pessoas/${idPessoa}/unidade`, {
        idUnidade: idUnidade === null ? null : Number(idUnidade),
      })
    )
  );
}
