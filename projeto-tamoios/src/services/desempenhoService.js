import { api } from "./api";
import { boletimEntregue, declaracaoCompleta } from "./historicoEscolarService.js";

const ANO_MATRICULA = 2024;

const CLASSES_POR_IDADE = {
  10: "Amigo",
  11: "Companheiro",
  12: "Pesquisador",
  13: "Pioneiro",
  14: "Excursionista",
  15: "Guia",
};

const IDADES = Object.keys(CLASSES_POR_IDADE).map(Number);

const anoDeNascimento = (dataNascimento) =>
  dataNascimento ? Number(dataNascimento.slice(0, 4)) : null;

export function classeNoAno(dataNascimento, ano) {
  const nascimento = anoDeNascimento(dataNascimento);
  return nascimento ? CLASSES_POR_IDADE[ano - nascimento] ?? null : null;
}

export function primeiroAnoDeClasse(dataNascimento) {
  const nascimento = anoDeNascimento(dataNascimento);
  return nascimento ? nascimento + Math.min(...IDADES) : null;
}

const paraConcluida = (dados) => ({
  id: dados.id,
  idEspecialidade: dados.idEspecialidade,
  nome: dados.nomeEspecialidade,
  ano: dados.ano,
});

export async function listarEspecialidadesConcluidas(idPessoa) {
  const { data } = await api.get(`/especialidades-concluidas/pessoa/${idPessoa}`);
  return data.map(paraConcluida);
}

export async function concluirEspecialidade(idPessoa, idEspecialidade, ano) {
  const { data } = await api.post("/especialidades-concluidas", { idPessoa, idEspecialidade, ano });
  return paraConcluida(data);
}

export async function desfazerEspecialidade(id) {
  await api.delete(`/especialidades-concluidas/${id}`);
}

// Regra da Insígnia de Excelência (Regulamento Interno / Manual Administrativo
// do Clube de Desbravadores) — critérios não quantificáveis (conduta, voto e
// lei, iniciativa, relacionamento) são acompanhados via ausência de
// Ocorrências no período, conforme decisão do case do projeto. Avaliada por
// ano, já que a insígnia é concedida ao final de cada ano. `ocorrenciasDoAno`
// vem do backend real (ver ocorrenciasService.js), já filtrada pelo ano.
export function calcularElegibilidadeInsignia({ ano, especialidades, ocorrenciasDoAno, historico }) {
  const criterios = [
    {
      label: `Membro ativo do clube em ${ano} (matriculado há 1 ano ou mais)`,
      atendido: ano >= ANO_MATRICULA,
    },
    {
      label: "Concluiu a Classe e todas as especialidades pedidas nela",
      atendido: historico?.outroClube
        ? historico.classeConcluidaOrigem
        : especialidades.length > 0 && especialidades.every((especialidade) => especialidade.concluida),
    },
    {
      label: "Sem ocorrências registradas no período (conduta, voto e lei, iniciativa, relacionamento)",
      atendido: ocorrenciasDoAno.length === 0,
    },
    {
      label: "Desempenho escolar em dia (boletim entregue)",
      atendido: boletimEntregue(historico),
    },
    {
      label: "Declaração dos pais completa (obediência, prestatividade, participação)",
      atendido: declaracaoCompleta(historico),
    },
  ];

  return { apto: criterios.every((criterio) => criterio.atendido), criterios };
}
