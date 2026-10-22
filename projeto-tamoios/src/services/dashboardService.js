import { getClasses, getEspecialidades } from "./classesService.js";
import { getMembros } from "./membrosService.js";
import { getEventos } from "./chamadasService.js";

function valorOuNulo(resultado) {
  return resultado.status === "fulfilled" ? resultado.value : null;
}

function normalizarEvento(evento) {
  const inicio = evento.dataInicio ?? "";
  return {
    id: evento.idEvento,
    titulo: evento.nome ?? "Evento",
    tipo: evento.tipo ?? "",
    inicio,
    fim: evento.dataFim ?? inicio,
  };
}

export async function getDadosDashboard() {
  const [membros, especialidades, classes, eventos] = (
    await Promise.allSettled([
      getMembros(),
      getEspecialidades(),
      getClasses(),
      getEventos(),
    ])
  ).map(valorOuNulo);

  return {
    membros,
    totalEspecialidades: especialidades?.length ?? null,
    totalClasses: classes?.length ?? null,
    eventos: Array.isArray(eventos)
      ? eventos.map(normalizarEvento).filter((evento) => evento.inicio)
      : null,
  };
}
