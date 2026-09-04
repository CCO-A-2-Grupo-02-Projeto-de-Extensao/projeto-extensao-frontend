import { useEffect, useState } from "react";

import { Insignia } from "../Insignia/Insignia.jsx";
import {
  CATEGORIAS_ESPECIALIDADES,
  TODAS_CATEGORIAS,
} from "../../utils/especialidadeCategorias.js";

import styles from "../../styles/especialidadeModal.module.css";

const VALOR_INICIAL = {
  nome: "",
  categoria: TODAS_CATEGORIAS,
  descricao: "",
  imagem: "",
};

export function EspecialidadeModal({
  aberto,
  especialidade,
  salvando = false,
  onFechar,
  onSalvar,
}) {
  const [formulario, setFormulario] = useState(VALOR_INICIAL);

  const modoEdicao = Boolean(especialidade);

  useEffect(() => {
    if (especialidade) {
      setFormulario({
        nome: especialidade.nome || "",
        categoria: especialidade.categoria || TODAS_CATEGORIAS,
        descricao: especialidade.descricao || "",
        imagem: especialidade.imagem || "",
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

    if (formulario.categoria === TODAS_CATEGORIAS) {
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
      imagem: formulario.imagem.trim() || null,
    });
  };

  return (
    <div className={styles.overlay} onMouseDown={onFechar}>
      <div className={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
        <div className={styles.cabecalho}>
          <h2>{modoEdicao ? "Editar Disciplina" : "Adicionar Disciplina"}</h2>

          <button
            type="button"
            className={styles.fechar}
            onClick={onFechar}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        <form className={styles.formulario} onSubmit={enviarFormulario}>
          <div className={styles.campo}>
            <label htmlFor="nome-especialidade">Nome</label>

            <input
              id="nome-especialidade"
              type="text"
              maxLength={45}
              value={formulario.nome}
              onChange={(e) => alterarCampo("nome", e.target.value)}
              placeholder="Digite o nome da especialidade"
            />
          </div>

          <div className={styles.campo}>
            <label htmlFor="categoria-especialidade">Categoria</label>

            <select
              id="categoria-especialidade"
              value={formulario.categoria}
              onChange={(e) => alterarCampo("categoria", e.target.value)}
            >
              <option value={TODAS_CATEGORIAS}>Selecione uma categoria</option>

              {CATEGORIAS_ESPECIALIDADES.map((nome) => (
                <option key={nome} value={nome}>
                  {nome}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.campo}>
            <label htmlFor="imagem-especialidade">Insígnia (link)</label>

            <div className={styles.linhaImagem}>
              <input
                id="imagem-especialidade"
                type="url"
                maxLength={500}
                value={formulario.imagem}
                onChange={(e) => alterarCampo("imagem", e.target.value)}
                placeholder="https://..."
              />

              <Insignia
                src={formulario.imagem.trim()}
                alt="Prévia da insígnia"
                className={styles.previaImagem}
              />
            </div>
          </div>

          <div className={styles.campo}>
            <label htmlFor="descricao-especialidade">Descrição</label>

            <textarea
              id="descricao-especialidade"
              value={formulario.descricao}
              onChange={(e) => alterarCampo("descricao", e.target.value)}
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
              disabled={salvando}
            >
              {salvando ? "Salvando..." : modoEdicao ? "Salvar" : "Adicionar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EspecialidadeModal;
