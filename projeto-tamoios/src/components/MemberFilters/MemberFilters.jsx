import { useEffect, useState } from "react";
import { Select } from "../Select/Select.jsx";
import { Input } from "../Input/Input.jsx";
import { CATEGORIAS } from "../../services/membrosService.js";
import styles from "../../styles/memberFilters.module.css";

const DEBOUNCE_MS = 350;

export function MemberFilters({
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
          <option value={CATEGORIAS.TODOS}>Todos</option>
          <option value={CATEGORIAS.ADMINISTRATIVO}>Administrativo</option>
          <option value={CATEGORIAS.INSTRUTOR}>Instrutores</option>
          <option value={CATEGORIAS.ALUNO}>Alunos</option>
        </Select>
      </div>

      <div className={styles.campoBusca}>
        <Input
          type="search"
          placeholder="Buscar"
          value={textoBusca}
          onChange={(e) => setTextoBusca(e.target.value)}
          aria-label="Buscar membro por nome"
        />
      </div>
    </div>
  );
}

export default MemberFilters;
