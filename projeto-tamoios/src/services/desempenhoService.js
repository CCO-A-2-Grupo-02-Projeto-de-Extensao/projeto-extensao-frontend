const MOCK_DELAY_MS = 300;

const ESPECIALIDADES_POR_CLASSE = {
  Amigo: ["Primeiros Socorros I", "Nós e Amarras", "Natureza I"],
  Companheiro: ["Primeiros Socorros II", "Acampamento I", "Culinária"],
  Pesquisador: ["Primeiros Socorros III", "Astronomia", "Orientação no Mato"],
  Pioneiro: ["Liderança I", "Sobrevivência", "Meio Ambiente"],
  Excursionista: ["Liderança II", "Cartografia", "Nutrição"],
  Guia: ["Liderança III", "Missões", "Ética Cristã"],
};

// Mock em memória — perdido ao recarregar a página, já que ainda não existe
// backend para Especialidade/conclusão por pessoa nem para o boletim/declaração.
const desempenhoPorMembro = new Map();

function gerarBucketAno(membro) {
  const especialidadesDaClasse = ESPECIALIDADES_POR_CLASSE[membro.classe] ?? [];

  return {
    especialidades: especialidadesDaClasse.map((nome, indice) => ({
      id: `${membro.id}-especialidade-${indice}`,
      nome,
      concluida: false,
    })),
    boletim: { anoLetivoSerie: "", arquivo: null },
    declaracaoPais: {
      obediencia: false,
      prestatividade: false,
      participacao: false,
      arquivo: null,
    },
  };
}

// Especialidades, boletim e declaração dos pais são acompanhados por ano
// (a insígnia de excelência é concedida anualmente, e a classe do membro
// muda de ano a ano). Ocorrências já vêm do backend real (ver
// services/ocorrenciasService.js) — não fazem parte deste mock.
function gerarDesempenhoPadrao(membro) {
  const anoAtual = new Date().getFullYear();

  return {
    matriculaAno: 2024,
    anoSelecionado: anoAtual,
    anos: [anoAtual],
    porAno: { [anoAtual]: gerarBucketAno(membro) },
  };
}

export function getDesempenho(membro) {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!desempenhoPorMembro.has(membro.id)) {
        desempenhoPorMembro.set(membro.id, gerarDesempenhoPadrao(membro));
      }
      resolve(desempenhoPorMembro.get(membro.id));
    }, MOCK_DELAY_MS);
  });
}

export function salvarDesempenho(membro, desempenho) {
  desempenhoPorMembro.set(membro.id, desempenho);
  return Promise.resolve(desempenho);
}

export function adicionarAno(desempenho, membro) {
  const proximoAno = Math.max(...desempenho.anos) + 1;

  return {
    ...desempenho,
    anos: [...desempenho.anos, proximoAno].sort((a, b) => b - a),
    anoSelecionado: proximoAno,
    porAno: { ...desempenho.porAno, [proximoAno]: gerarBucketAno(membro) },
  };
}

// Regra da Insígnia de Excelência (Regulamento Interno / Manual Administrativo
// do Clube de Desbravadores) — critérios não quantificáveis (conduta, voto e
// lei, iniciativa, relacionamento) são acompanhados via ausência de
// Ocorrências no período, conforme decisão do case do projeto. Avaliada por
// ano, já que a insígnia é concedida ao final de cada ano. `ocorrenciasDoAno`
// vem do backend real (ver ocorrenciasService.js), já filtrada pelo ano.
export function calcularElegibilidadeInsignia(desempenho, ano, ocorrenciasDoAno) {
  const bucket = desempenho.porAno[ano];

  const especialidadesConcluidas =
    bucket.especialidades.length > 0 &&
    bucket.especialidades.every((especialidade) => especialidade.concluida);

  const semOcorrencias = ocorrenciasDoAno.length === 0;

  const declaracaoCompleta =
    bucket.declaracaoPais.obediencia &&
    bucket.declaracaoPais.prestatividade &&
    bucket.declaracaoPais.participacao;

  const boletimEntregue = Boolean(bucket.boletim.anoLetivoSerie && bucket.boletim.arquivo);

  const criterios = [
    {
      label: `Membro ativo do clube em ${ano} (matriculado há 1 ano ou mais)`,
      atendido: Boolean(desempenho.matriculaAno) && ano >= desempenho.matriculaAno,
    },
    {
      label: "Concluiu a Classe e todas as especialidades pedidas nela",
      atendido: especialidadesConcluidas,
    },
    {
      label: "Sem ocorrências registradas no período (conduta, voto e lei, iniciativa, relacionamento)",
      atendido: semOcorrencias,
    },
    {
      label: "Desempenho escolar em dia (boletim entregue)",
      atendido: boletimEntregue,
    },
    {
      label: "Declaração dos pais completa (obediência, prestatividade, participação)",
      atendido: declaracaoCompleta,
    },
  ];

  const apto = criterios.every((criterio) => criterio.atendido);

  return { apto, criterios };
}
