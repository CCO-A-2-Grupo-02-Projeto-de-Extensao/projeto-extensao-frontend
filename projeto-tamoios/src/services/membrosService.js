// eslint-disable-next-line no-unused-vars -- usado quando o endpoint real for integrado, ver getMembros()
import { api } from "./api";

export const CATEGORIAS = {
  TODOS: "todos",
  ADMINISTRATIVO: "administrativo",
  INSTRUTOR: "instrutor",
  ALUNO: "aluno",
};

const MOCK_DELAY_MS = 400;

const MOCK_MEMBROS = [
  { id: 1, nome: "Ademar Teste", papel: "Teste", categoria: CATEGORIAS.ADMINISTRATIVO, documentacao: false },
  { id: 2, nome: "Fernanda Alves", papel: "Tesoureira", categoria: CATEGORIAS.ADMINISTRATIVO, documentacao: true },
  { id: 3, nome: "Maria Souza", papel: "Secretária", categoria: CATEGORIAS.ADMINISTRATIVO, documentacao: true },

  { id: 4, nome: "Bruno Lima", papel: "Instrutor", categoria: CATEGORIAS.INSTRUTOR, documentacao: true },
  { id: 5, nome: "Carla Nunes", papel: "Instrutor", categoria: CATEGORIAS.INSTRUTOR, documentacao: true },
  { id: 6, nome: "Diego Martins", papel: "Instrutor", categoria: CATEGORIAS.INSTRUTOR, documentacao: true },
  { id: 7, nome: "Elaine Rocha", papel: "Instrutor", categoria: CATEGORIAS.INSTRUTOR, documentacao: true },
  { id: 8, nome: "Fábio Teixeira", papel: "Instrutor", categoria: CATEGORIAS.INSTRUTOR, documentacao: true },

  { id: 9, nome: "Gabriel Santos", papel: "Aluno", categoria: CATEGORIAS.ALUNO, documentacao: true },
  { id: 10, nome: "Helena Costa", papel: "Aluno", categoria: CATEGORIAS.ALUNO, documentacao: true },
  { id: 11, nome: "Igor Farias", papel: "Aluno", categoria: CATEGORIAS.ALUNO, documentacao: true },
  { id: 12, nome: "Julia Pereira", papel: "Aluno", categoria: CATEGORIAS.ALUNO, documentacao: false },
  { id: 13, nome: "Kauã Ribeiro", papel: "Aluno", categoria: CATEGORIAS.ALUNO, documentacao: true },
  { id: 14, nome: "Larissa Mendes", papel: "Aluno", categoria: CATEGORIAS.ALUNO, documentacao: true },
  { id: 15, nome: "Miguel Oliveira", papel: "Aluno", categoria: CATEGORIAS.ALUNO, documentacao: true },
  { id: 16, nome: "Natália Barbosa", papel: "Aluno", categoria: CATEGORIAS.ALUNO, documentacao: true },
  { id: 17, nome: "Otávio Cardoso", papel: "Aluno", categoria: CATEGORIAS.ALUNO, documentacao: true },
  { id: 18, nome: "Patrícia Gomes", papel: "Aluno", categoria: CATEGORIAS.ALUNO, documentacao: true },
  { id: 19, nome: "Rafael Dias", papel: "Aluno", categoria: CATEGORIAS.ALUNO, documentacao: true },
  { id: 20, nome: "Sabrina Rocha", papel: "Aluno", categoria: CATEGORIAS.ALUNO, documentacao: true },
  { id: 21, nome: "Thiago Almeida", papel: "Aluno", categoria: CATEGORIAS.ALUNO, documentacao: false },
  { id: 22, nome: "Vitória Nascimento", papel: "Aluno", categoria: CATEGORIAS.ALUNO, documentacao: true },
  { id: 23, nome: "William Correia", papel: "Aluno", categoria: CATEGORIAS.ALUNO, documentacao: true },
  { id: 24, nome: "Yasmin Freitas", papel: "Aluno", categoria: CATEGORIAS.ALUNO, documentacao: true },
  { id: 25, nome: "André Monteiro", papel: "Aluno", categoria: CATEGORIAS.ALUNO, documentacao: true },
  { id: 26, nome: "Beatriz Cavalcanti", papel: "Aluno", categoria: CATEGORIAS.ALUNO, documentacao: true },
];

export async function getMembros() {
  // Integração futura: quando o endpoint existir no backend, basta remover o
  // mock abaixo e descomentar a chamada real via axios.
  // const { data } = await api.get("/membros");
  // return data;

  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_MEMBROS), MOCK_DELAY_MS);
  });
}
