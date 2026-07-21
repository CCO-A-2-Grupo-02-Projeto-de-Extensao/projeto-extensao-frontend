import { api } from "./api";

// Catálogos somente-leitura usados pelos dropdowns do formulário de
// cadastro/edição de desbravador. Vêm de tabelas de referência do backend
// (Classe, Cargo, Genero, Unidade), sem CRUD do lado do front.

export async function getClasses() {
  const { data } = await api.get("/classes");
  return data;
}

export async function getCargos() {
  const { data } = await api.get("/cargos");
  return data;
}

export async function getGeneros() {
  const { data } = await api.get("/generos");
  return data;
}

export async function getUnidades() {
  const { data } = await api.get("/unidades");
  return data;
}
