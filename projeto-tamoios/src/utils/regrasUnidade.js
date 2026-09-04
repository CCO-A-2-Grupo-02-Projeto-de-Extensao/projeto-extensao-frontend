export const MINIMO_DESBRAVADORES = 4;
export const MAXIMO_DESBRAVADORES = 8;

export const FAIXAS_ETARIAS = ["10 - 11", "12 - 13", "14 - 15"];

export function idadeEm(dataNascimento) {
  if (!dataNascimento) return null;

  const nascimento = new Date(dataNascimento);
  if (Number.isNaN(nascimento.getTime())) return null;

  const hoje = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mes = hoje.getMonth() - nascimento.getMonth();

  if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
    idade -= 1;
  }

  return idade;
}

export function limitesDaFaixa(faixaEtaria) {
  const numeros = String(faixaEtaria ?? "").match(/\d+/g);
  if (!numeros || numeros.length < 2) return null;

  const primeiro = Number(numeros[0]);
  const segundo = Number(numeros[1]);
  return [Math.min(primeiro, segundo), Math.max(primeiro, segundo)];
}

export function cabeNaUnidade(pessoa, { idGenero, faixaEtaria }) {
  if (idGenero && pessoa.idGenero && Number(pessoa.idGenero) !== Number(idGenero)) {
    return false;
  }

  const limites = limitesDaFaixa(faixaEtaria);
  const idade = idadeEm(pessoa.dataNascimento);

  if (limites && idade !== null && (idade < limites[0] || idade > limites[1])) {
    return false;
  }

  return true;
}

export function temVaga(unidade) {
  return (unidade?.quantidadeDesbravadores ?? 0) < MAXIMO_DESBRAVADORES;
}
