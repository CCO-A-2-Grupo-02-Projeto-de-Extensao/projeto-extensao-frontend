import { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { Button } from "../Button/Button.jsx";
import { Input } from "../Input/Input.jsx";
import { Select } from "../Select/Select.jsx";
import { criarEvento } from "../../services/chamadasService.js";
import { paraChaveData } from "../../utils/datas.js";
import modalStyles from "../../styles/uploadDocumentoModal.module.css";
import formStyles from "../../styles/cadastroDesbravadorModal.module.css";
import styles from "../../styles/adicionarEventosModal.module.css";

const TIPOS = ["Reunião", "Atividade", "Acampamento", "Passeio", "Cerimônia", "Outro"];

function Rotulo({ htmlFor, texto, obrigatorio }) {
  return (
    <label className={formStyles.campoLabel} htmlFor={htmlFor}>
      {texto}
      {obrigatorio ? (
        <span className={formStyles.obrigatorio}> *</span>
      ) : (
        <span className={formStyles.opcional}> (opcional)</span>
      )}
    </label>
  );
}

export function AdicionarEventoModal({ dataInicial, onFechar, onCadastrar }) {
  const [form, setForm] = useState(() => ({
    nome: "",
    tipo: TIPOS[0],
    inicio: paraChaveData(dataInicial),
    fim: "",
    descricao: "",
  }));
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  const alterar = (campo, valor) => {
    setForm((atual) => ({ ...atual, [campo]: valor }));
    setErro("");
  };

  const aoSalvar = async () => {
    if (!form.nome.trim()) {
      setErro("Informe o nome do evento.");
      return;
    }
    if (!form.inicio) {
      setErro("Informe a data de início.");
      return;
    }
    if (form.fim && form.fim < form.inicio) {
      setErro("O término não pode ser antes do início.");
      return;
    }

    setSalvando(true);
    try {
      await criarEvento({
        nome: form.nome.trim(),
        tipo: form.tipo,
        dataInicio: form.inicio,
        dataFim: form.fim || form.inicio,
        descricao: form.descricao.trim() || null,
      });
      await onCadastrar();
    } catch (erroRequisicao) {
      setErro(
        erroRequisicao.response?.data?.erro ??
          "Não foi possível adicionar o evento. Tente novamente."
      );
      setSalvando(false);
    }
  };

  return (
    <div className={modalStyles.overlay}>
      <div
        className={`${modalStyles.modal} ${styles.modal}`}
        role="dialog"
        aria-labelledby="evento-titulo"
      >
        <header className={modalStyles.cabecalho}>
          <div>
            <h2 id="evento-titulo" className={modalStyles.titulo}>
              Adicionar evento
            </h2>
            <p className={`${modalStyles.subtitulo} ${styles.subtitulo}`}>
              O evento aparece na agenda da tela de início.
            </p>
          </div>
          <Button
            variante="fechar"
            onClick={onFechar}
            aria-label="Fechar"
            disabled={salvando}
          >
            <CloseIcon />
          </Button>
        </header>

        <div className={modalStyles.corpo}>
          {erro && (
            <p className={styles.erro} role="alert">
              {erro}
            </p>
          )}

          <div className={formStyles.grid}>
            <div className={formStyles.campoSpan2}>
              <Rotulo htmlFor="evento-nome" texto="Nome do evento" obrigatorio />
              <Input
                id="evento-nome"
                value={form.nome}
                onChange={(e) => alterar("nome", e.target.value)}
                autoFocus
              />
            </div>

            <div className={formStyles.campoSpan2}>
              <Rotulo htmlFor="evento-tipo" texto="Tipo" obrigatorio />
              <Select
                id="evento-tipo"
                value={form.tipo}
                onChange={(e) => alterar("tipo", e.target.value)}
              >
                {TIPOS.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </Select>
            </div>

            <div className={formStyles.campo}>
              <Rotulo htmlFor="evento-inicio" texto="Início" obrigatorio />
              <Input
                id="evento-inicio"
                type="date"
                value={form.inicio}
                onChange={(e) => alterar("inicio", e.target.value)}
              />
            </div>

            <div className={formStyles.campo}>
              <Rotulo htmlFor="evento-fim" texto="Término" />
              <Input
                id="evento-fim"
                type="date"
                min={form.inicio}
                value={form.fim}
                onChange={(e) => alterar("fim", e.target.value)}
              />
            </div>

            <div className={formStyles.campoSpan2}>
              <Rotulo htmlFor="evento-descricao" texto="Descrição" />
              <textarea
                id="evento-descricao"
                className={styles.descricao}
                value={form.descricao}
                onChange={(e) => alterar("descricao", e.target.value)}
              />
            </div>
          </div>
        </div>

        <footer className={modalStyles.rodape}>
          <Button
            variante="secundario"
            className={styles.botaoRodape}
            onClick={onFechar}
            disabled={salvando}
            texto="Cancelar"
          />
          <Button
            className={styles.botaoRodape}
            onClick={aoSalvar}
            disabled={salvando}
            texto={salvando ? "Adicionando..." : "Adicionar evento"}
          />
        </footer>
      </div>
    </div>
  );
}

export default AdicionarEventoModal;
