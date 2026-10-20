import { getMembros } from "./membrosService";
import { getClasses, getEspecialidades } from "./classesService";

const VALIDADE_MS = 60 * 1000;
const LIMITE_POR_GRUPO = 5;

let cache = null;

export function normalizar(texto) {
  return String(texto ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

function montarIndice([membros, classes, especialidades]) {
  const valor = (resultado) =>
    resultado.status === "fulfilled" ? resultado.value : [];

  return [
    ...valor(membros).map((membro) => ({
      grupo: "Membros",
      chave: `membro-${membro.id}`,
      titulo: membro.nome,
      detalhe: [membro.papel, membro.unidade, membro.classe]
        .filter(Boolean)
        .join(" • "),
      inativo: !membro.ativo,
      caminho: `/dashboard/desbravadores/${membro.id}`,
      termos: [membro.nome, membro.papel, membro.unidade, membro.classe],
    })),
    ...valor(classes).map((classe) => ({
      grupo: "Classes",
      chave: `classe-${classe.id}`,
      titulo: classe.nome,
      detalhe: "Classe",
      caminho: `/dashboard/classes/${classe.id}`,
      termos: [classe.nome],
    })),
    ...valor(especialidades).map((especialidade) => ({
      grupo: "Especialidades",
      chave: `especialidade-${especialidade.id}`,
      titulo: especialidade.nome,
      detalhe: especialidade.categoria,
      caminho: "/dashboard/especialidades",
      estado: { busca: especialidade.nome },
      termos: [especialidade.nome, especialidade.categoria],
    })),
  ].map((item) => ({ ...item, termos: item.termos.map(normalizar) }));
}

export function carregarIndiceBusca() {
  if (!cache || Date.now() - cache.criadoEm > VALIDADE_MS) {
    const promessa = Promise.allSettled([
      getMembros(),
      getClasses(),
      getEspecialidades(),
    ]).then(montarIndice);
    cache = { criadoEm: Date.now(), promessa };
  }
  return cache.promessa;
}

export function buscar(itens, termo) {
  const alvo = normalizar(termo);
  if (!alvo) return [];

  const grupos = new Map();
  itens
    .map((item) => {
      const melhor = Math.min(
        ...item.termos.map((t, posicao) => {
          const peso = posicao === 0 ? 0 : 2;
          if (t.startsWith(alvo)) return peso;
          if (t.includes(alvo)) return peso + 1;
          return Infinity;
        })
      );
      return { item, melhor };
    })
    .filter(({ melhor }) => melhor !== Infinity)
    .sort(
      (a, b) =>
        a.melhor - b.melhor || a.item.titulo.localeCompare(b.item.titulo)
    )
    .forEach(({ item }) => {
      const lista = grupos.get(item.grupo) ?? [];
      if (lista.length < LIMITE_POR_GRUPO) lista.push(item);
      grupos.set(item.grupo, lista);
    });
  return [...grupos.values()].flat();
}
