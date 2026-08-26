import { getEspecialidades } from "./classesService.js";
import { getMembros } from "./membrosService.js";

const agora = new Date();
const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
const amanha = new Date(hoje);
amanha.setDate(hoje.getDate() + 1);

function paraChaveData(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

// TODO: substituir pelos endpoints de calendário, feriados e frequência quando
// esses recursos estiverem disponíveis no backend.
const controleAcademicoMock = {
  feriadosNoMes: 2,
  eventos: [
    {
      id: 1,
      data: paraChaveData(hoje),
      horario: "Dia inteiro",
      titulo: "Atividade do clube",
    },
    {
      id: 2,
      data: paraChaveData(amanha),
      horario: "14:00",
      titulo: "Reunião de instrutores",
    },
  ],
  faltasPorCategoria: {
    todos: { faltas: 9, presencas: 83 },
    desbravadores: { faltas: 7, presencas: 70 },
    instrutores: { faltas: 2, presencas: 13 },
  },
};

const indicadoresMock = {
  desbravadores: 52,
  especialidades: 34,
  instrutores: 11,
  feriados: controleAcademicoMock.feriadosNoMes,
};

function comTempoLimite(promessa, milissegundos = 5000) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error("Tempo limite da requisição excedido.")),
      milissegundos
    );

    promessa.then(
      (resultado) => {
        clearTimeout(timeout);
        resolve(resultado);
      },
      (erro) => {
        clearTimeout(timeout);
        reject(erro);
      }
    );
  });
}

export async function getDadosDashboard() {
  const [resultadoMembros, resultadoEspecialidades] = await Promise.allSettled([
    comTempoLimite(getMembros()),
    comTempoLimite(getEspecialidades()),
  ]);

  const membros =
    resultadoMembros.status === "fulfilled" ? resultadoMembros.value : null;
  const especialidades =
    resultadoEspecialidades.status === "fulfilled"
      ? resultadoEspecialidades.value
      : null;

  return {
    indicadores: {
      desbravadores: membros
        ? membros.filter(
            (membro) => membro.categoria?.toLowerCase() === "aluno"
          ).length
        : indicadoresMock.desbravadores,
      especialidades: especialidades?.length ?? indicadoresMock.especialidades,
      instrutores: membros
        ? membros.filter(
            (membro) => membro.categoria?.toLowerCase() === "instrutor"
          ).length
        : indicadoresMock.instrutores,
      feriados: indicadoresMock.feriados,
    },
    controleAcademico: controleAcademicoMock,
  };
}
