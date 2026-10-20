// Identidade visual de cada classe regular: cor do banner, idade e subtítulo.
// Usado pelo card da lista e pela página interna da classe.
// Classes que não estiverem aqui caem no PADRAO (vinho do clube).

const PADRAO = { idade: null, cor: "#4a1420", subtitulo: null };

const CLASSES = {
  amigo: { idade: 10, cor: "#1f3a6e", subtitulo: "Amigo da Natureza" },
  companheiro: { idade: 11, cor: "#8c1d22", subtitulo: "Companheiro de Excursão" },
  pesquisador: { idade: 12, cor: "#1f5a3a", subtitulo: "Pesquisador de Campo" },
  pioneiro: { idade: 13, cor: "#44474d", subtitulo: "Pioneiro de Novas Fronteiras" },
  excursionista: { idade: 14, cor: "#5b2a6e", subtitulo: "Excursionista na Mata" },
  guia: { idade: 15, cor: "#b8860b", subtitulo: "Guia de Exploração" },
};

function normalizar(nome) {
  return String(nome ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/^classe\s+/, "")
    .trim();
}

export function visualDaClasse(nome) {
  const chave = normalizar(nome);
  const achada = Object.keys(CLASSES).find(
    (k) => chave === k || chave.startsWith(`${k} `)
  );
  return achada ? CLASSES[achada] : PADRAO;
}
