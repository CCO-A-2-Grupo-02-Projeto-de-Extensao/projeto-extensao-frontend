const cache = new Map();

export function getFeriados(ano) {
  if (!cache.has(ano)) {
    const busca = fetch(`https://brasilapi.com.br/api/feriados/v1/${ano}`)
      .then((resposta) => {
        if (!resposta.ok) throw new Error(`BrasilAPI respondeu ${resposta.status}`);
        return resposta.json();
      })
      .then((feriados) => feriados.map(({ date, name }) => ({ data: date, nome: name })))
      .catch(() => {
        cache.delete(ano);
        return [];
      });
    cache.set(ano, busca);
  }
  return cache.get(ano);
}
