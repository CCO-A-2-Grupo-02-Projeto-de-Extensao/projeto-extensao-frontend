import amigo from "../assets/classes/amigo.svg";
import companheiro from "../assets/classes/companheiro.svg";
import pesquisador from "../assets/classes/pesquisador.svg";
import pioneiro from "../assets/classes/pioneiro.svg";
import excursionista from "../assets/classes/excursionista.svg";
import guia from "../assets/classes/guia.svg";

// A placa de cada classe é um SVG fixo do material do clube, e o backend
// (CatalogoResponse) devolve só id e nome. O casamento é pelo nome normalizado
// — sem acento e em minúsculas — para não depender do id, que muda conforme a
// ordem do seed.
const POR_NOME = {
  amigo,
  companheiro,
  pesquisador,
  pioneiro,
  excursionista,
  guia,
};

export function normalizarNomeClasse(nome) {
  return (nome || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

// Classe nova cadastrada pelo clube não tem placa: devolve null e o card cai no
// fundo neutro em vez de quebrar a imagem.
export function imagemDaClasse(nome) {
  return POR_NOME[normalizarNomeClasse(nome)] ?? null;
}

export default imagemDaClasse;
