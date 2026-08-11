import { useEffect, useState } from "react";

import {
  CATEGORIAS_ESPECIALIDADES,
} from "../EspecialidadeFilters/EspecialidadeFilters.jsx";

import styles from "../../styles/especialidadeModal.module.css";

const VALOR_INICIAL = {
  nome: "",
  categoria: CATEGORIAS_ESPECIALIDADES.TODOS,
  descricao: "",
};

export function EspecialidadeModal({
  aberto,
  especialidade,
  onFechar,
  onSalvar,
}) {
  const [formulario, setFormulario] = useState(VALOR_INICIAL);

  const modoEdicao = Boolean(especialidade);

  useEffect(() => {
    if (especialidade) {
      setFormulario({
        nome: especialidade.nome || "",
        categoria:
          especialidade.categoria ||
          CATEGORIAS_ESPECIALIDADES.TODOS,
        descricao: especialidade.descricao || "",
      });
    } else {
      setFormulario(VALOR_INICIAL);
    }
  }, [especialidade, aberto]);

  if (!aberto) {
    return null;
  }

  const alterarCampo = (campo, valor) => {
    setFormulario((atual) => ({
      ...atual,
      [campo]: valor,
    }));
  };

  const enviarFormulario = (e) => {
    e.preventDefault();

    if (!formulario.nome.trim()) {
      alert("Digite o nome da especialidade.");
      return;
    }

    if (
      formulario.categoria ===
      CATEGORIAS_ESPECIALIDADES.TODOS
    ) {
      alert("Selecione uma categoria.");
      return;
    }

    if (!formulario.descricao.trim()) {
      alert("Digite a descrição da especialidade.");
      return;
    }

    onSalvar({
      nome: formulario.nome.trim(),
      categoria: formulario.categoria,
      descricao: formulario.descricao.trim(),
    });
  };

  return (
    <div
      className={styles.overlay}
      onMouseDown={onFechar}
    >
      <div
        className={styles.modal}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className={styles.cabecalho}>
          <h2>
            {modoEdicao
              ? "Editar Disciplina"
              : "Adicionar Disciplina"}
          </h2>

          <button
            type="button"
            className={styles.fechar}
            onClick={onFechar}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        <form
          className={styles.formulario}
          onSubmit={enviarFormulario}
        >
          <div className={styles.campo}>
            <label htmlFor="nome-especialidade">
              Nome
            </label>

            <input
              id="nome-especialidade"
              type="text"
              value={formulario.nome}
              onChange={(e) =>
                alterarCampo("nome", e.target.value)
              }
              placeholder="Digite o nome da especialidade"
            />
          </div>

          <div className={styles.campo}>
            <label htmlFor="categoria-especialidade">
              Categoria
            </label>

            <select
              id="categoria-especialidade"
              value={formulario.categoria}
              onChange={(e) =>
                alterarCampo(
                  "categoria",
                  e.target.value
                )
              }
            >
              <option
                value={
                  CATEGORIAS_ESPECIALIDADES.TODOS
                }
              >
                Selecione uma categoria
              </option>

              <option
                value={
                  CATEGORIAS_ESPECIALIDADES.ARTES_MANUAIS
                }
              >
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
                value={
                  CATEGORIAS_ESPECIALIDADES.ESTUDOS_NATUREZA
                }
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
            </select>
          </div>

          <div className={styles.campo}>
            <label htmlFor="descricao-especialidade">
              Descrição
            </label>

            <textarea
              id="descricao-especialidade"
              value={formulario.descricao}
              onChange={(e) =>
                alterarCampo(
                  "descricao",
                  e.target.value
                )
              }
              placeholder="Digite a descrição da especialidade"
              rows={5}
            />
          </div>

          <div className={styles.botoes}>
            <button
              type="button"
              className={styles.botaoCancelar}
              onClick={onFechar}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className={styles.botaoSalvar}
            >
              {modoEdicao ? "Salvar" : "Adicionar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EspecialidadeModal;