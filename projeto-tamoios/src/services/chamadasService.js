import { api } from "./api";

export async function getEventos() {
  const { data } = await api.get("/eventos");
  return data;
}

export async function criarEvento(evento) {
  const { data } = await api.post("/eventos", evento);
  return data;
}

export async function getChamadasPorEvento(idEvento) {
  const { data } = await api.get(`/chamadas/evento/${idEvento}`);
  return data;
}

export async function criarChamada(chamada) {
  const { data } = await api.post("/chamadas", chamada);
  return data;
}

export async function deletarChamada(idChamada) {
  await api.delete(`/chamadas/${idChamada}`);
}

export async function getPresencasPorChamada(idChamada) {
  const { data } = await api.get(`/presencas/chamada/${idChamada}`);
  return data;
}

export async function registrarPresenca(presenca) {
  const { data } = await api.post("/presencas", presenca);
  return data;
}

export async function atualizarPresenca(idPresenca, presenca) {
  const { data } = await api.put(`/presencas/${idPresenca}`, presenca);
  return data;
}

export async function deletarPresenca(idPresenca) {
  await api.delete(`/presencas/${idPresenca}`);
}

/**
 * Busca a chamada de uma data específica (formato YYYY-MM-DD) diretamente.
 * Usa o endpoint GET /chamadas/data/{data} para evitar o padrão N+1 de
 * iterar todos os eventos. Retorna null se não houver chamada registrada.
 */
export async function buscarChamadaPorData(dataIso) {
  try {
    const { data } = await api.get(`/chamadas/data/${dataIso}`);
    return { chamada: data };
  } catch (err) {
    // 404 = chamada não existe ainda para essa data — comportamento normal
    if (err.response?.status === 404) {
      return null;
    }
    // Qualquer outro erro (rede, 500 etc.) propaga para o chamador tratar
    throw err;
  }
}

/**
 * Salva a chamada completa (cria evento + chamada se não existirem e
 * persiste/atualiza todas as presenças).
 */
export async function salvarChamadaCompleta({
  dataIso,
  titulo,
  membrosPresencas,
  chamadaExistente,
}) {
  let chamada = chamadaExistente;

  if (!chamada) {
    // Tenta buscar a chamada do dia (pode ter sido criada depois do carregamento)
    const encontrada = await buscarChamadaPorData(dataIso);
    if (encontrada?.chamada) {
      chamada = encontrada.chamada;
    } else {
      // Precisa de um evento para vincular a chamada — cria um genérico
      let evento;
      try {
        const eventos = await getEventos();
        // Reusa um evento existente que cubra exatamente essa data
        evento = eventos.find(
          (e) => e.dataInicio === dataIso && e.dataFim === dataIso
        );
      } catch {
        // Se /eventos falhar, segue criando um novo evento
      }

      if (!evento) {
        evento = await criarEvento({
          nome: titulo || `Reunião ${dataIso}`,
          tipo: "Reunião",
          dataInicio: dataIso,
          dataFim: dataIso,
          descricao: "Chamada de desbravadores",
        });
      }

      chamada = await criarChamada({
        idEvento: evento.idEvento,
        dataChamada: dataIso,
        titulo: titulo || `Chamada - ${dataIso}`,
      });
    }
  }

  const presencasSalvas = await Promise.all(
    membrosPresencas.map(async (item) => {
      if (item.idPresenca) {
        return atualizarPresenca(item.idPresenca, {
          idChamada: chamada.idChamada,
          idPessoa: item.id,
          presente: item.present,
        });
      }
      return registrarPresenca({
        idChamada: chamada.idChamada,
        idPessoa: item.id,
        presente: item.present,
      });
    })
  );

  return { chamada, presencas: presencasSalvas };
}

/**
 * Deleta uma chamada e todas as presenças associadas a ela.
 */
export async function deletarChamadaCompleta(idChamada) {
  // Primeiro remove as presenças, depois a chamada
  const presencas = await getPresencasPorChamada(idChamada);
  await Promise.all(presencas.map((p) => deletarPresenca(p.id)));
  await deletarChamada(idChamada);
}
