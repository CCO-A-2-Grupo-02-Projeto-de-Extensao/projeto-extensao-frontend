import { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";

import { Insignia } from "../Insignia/Insignia.jsx";
import { Button } from "../Button/Button.jsx";
import { useFecharAoClicarFora } from "../../hooks/useFecharAoClicarFora.js";
import {
  CATEGORIAS_ESPECIALIDADES,
  TODAS_CATEGORIAS,
} from "../../utils/especialidadeCategorias.js";

import casca from "../../styles/cascaModal.module.css";
import styles from "../../styles/especialidadeModal.module.css";

const VALOR_INICIAL = {
  nome: "",
  categoria: TODAS_CATEGORIAS,
  descricao: "",
  imagem: "",
};

function formularioDa(especialidade) {
  if (!especialidade) return VALOR_INICIAL;

  return {
    nome: especialidade.nome || "",
    categoria: especialidade.categoria || TODAS_CATEGORIAS,
    descricao: especialidade.descricao || "",
    imagem: especialidade.imagem || "",
  };
}

export function EspecialidadeModal({
  especialidade,
  salvando = false,
  onFechar,
  onSalvar,
}) {
  const [formulario, setFormulario] = useState(() => formularioDa(especialidade));
  const fecharAoClicarFora = useFecharAoClicarFora(onFechar);

  const modoEdicao = Boolean(especialidade);

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
    <div className={casca.overlay} {...fecharAoClicarFora}>
      <form
        className={`${casca.modal} ${styles.modal}`}
        onSubmit={enviarFormulario}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-especialidade"
      >
        <div className={casca.cabecalho}>
          <div>
            <h2 id="titulo-especialidade" className={casca.titulo}>
              {modoEdicao ? "Editar Disciplina" : "Adicionar Disciplina"}
            </h2>
            <span className={casca.subtitulo}>
              {modoEdicao
                ? "Altere os dados e salve para atualizar o catálogo."
                : "Preencha os dados para incluir no catálogo."}
            </span>
          </div>
          <Button variante="fechar" onClick={onFechar} aria-label="Fechar">
            <CloseIcon />
          </Button>
        </div>

        <div className={casca.corpo}>
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
        </div>

        <div className={casca.rodape}>
          <div className={casca.botoes}>
            <Button variante="secundario" onClick={onFechar} texto="Cancelar" />
            <Button
              type="submit"
              disabled={salvando}
              texto={salvando ? "Salvando..." : modoEdicao ? "Salvar" : "Adicionar"}
            />
          </div>
        </div>
      </form>
    </div>
  );
}

export default EspecialidadeModal;
