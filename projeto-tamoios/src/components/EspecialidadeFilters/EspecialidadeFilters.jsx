import { useEffect, useState } from "react";

import { Select } from "../Select/Select.jsx";
import { Input } from "../Input/Input.jsx";

import styles from "../../styles/especialidadeFilters.module.css";

const DEBOUNCE_MS = 350;

export const CATEGORIAS_ESPECIALIDADES = {
  TODOS: "todos",
  ARTES_MANUAIS: "Artes Manuais (AM)",
  ATIVIDADES_ESPIRITUAIS: "Atividades Espirituais (AE)",
  ATIVIDADES_RECREATIVAS: "Atividades Recreativas (AR)",
  ESTUDOS_NATUREZA: "Estudos da Natureza (EN)",
  HABILIDADES_DOMESTICAS: "Habilidades Domésticas (HD)",
};

export function EspecialidadeFilters({
  ordenacao,
  onOrdenacaoChange,
  categoria,
  onCategoriaChange,
  onBuscaChange,
}) {
  const [textoBusca, setTextoBusca] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      onBuscaChange(textoBusca);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [textoBusca, onBuscaChange]);

  return (
    <div className={styles.filtros}>
      <div className={styles.campoOrdenacao}>
        <Select
          value={ordenacao}
          onChange={(e) => onOrdenacaoChange(e.target.value)}
          aria-label="Ordenação"
        >
          <option value="az">A-Z</option>
          <option value="za">Z-A</option>
        </Select>
      </div>

      <div className={styles.campoCategoria}>
        <Select
          value={categoria}
          onChange={(e) => onCategoriaChange(e.target.value)}
          aria-label="Categoria"
        >
          <option value={CATEGORIAS_ESPECIALIDADES.TODOS}>
            Todos
          </option>

          <option value={CATEGORIAS_ESPECIALIDADES.ARTES_MANUAIS}>
            Artes Manuais (AM)
          </option>

          <option
            value={
              CATEGORIAS_ESPECIALIDADES.ATIVIDADES_ESPIRITUAIS
            }
          >
            Atividades Espirituais (AE)
          </option>

          <option
            value={
              CATEGORIAS_ESPECIALIDADES.ATIVIDADES_RECREATIVAS
            }
          >
            Atividades Recreativas (AR)
          </option>

          <option
            value={CATEGORIAS_ESPECIALIDADES.ESTUDOS_NATUREZA}
          >
            Estudos da Natureza (EN)
          </option>

          <option
            value={
              CATEGORIAS_ESPECIALIDADES.HABILIDADES_DOMESTICAS
            }
          >
            Habilidades Domésticas (HD)
          </option>
        </Select>
      </div>

      <div className={styles.campoBusca}>
        <Input
          type="search"
          placeholder="Buscar"
          value={textoBusca}
          onChange={(e) => setTextoBusca(e.target.value)}
          aria-label="Buscar especialidade por nome"
        />
      </div>
    </div>
  );
}

export default EspecialidadeFilters;