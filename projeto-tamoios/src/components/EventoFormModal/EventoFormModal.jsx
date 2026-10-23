import { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { Button } from "../Button/Button.jsx";
import { Input } from "../Input/Input.jsx";
import { Select } from "../Select/Select.jsx";
import { EscolhaEscopo } from "../EscolhaEscopo/EscolhaEscopo.jsx";
import { paraChaveData } from "../../utils/datas.js";
import modalStyles from "../../styles/uploadDocumentoModal.module.css";
import formStyles from "../../styles/cadastroDesbravadorModal.module.css";
import styles from "../../styles/eventoFormModal.module.css";

const TIPOS = ["Reunião", "Atividade", "Acampamento", "Passeio", "Cerimônia", "Outro"];

const REPETICOES = [
  { valor: "", rotulo: "Não repete" },
  { valor: "SEMANAL", rotulo: "Toda semana" },
  { valor: "QUINZENAL", rotulo: "A cada 2 semanas" },
  { valor: "MENSAL", rotulo: "Todo mês" },
];

function umAnoDepois(chaveData) {
  return `${Number(chaveData.slice(0, 4)) + 1}${chaveData.slice(4)}`;
}

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

function formularioInicial(evento, dataInicial) {
  if (!evento) {
    return {
      nome: "",
      tipo: TIPOS[0],
      inicio: paraChaveData(dataInicial),
      fim: "",
      repeticao: "",
      repetirAte: "",
      descricao: "",
    };
  }
  return {
    nome: evento.titulo,
    tipo: evento.tipo || TIPOS[0],
    inicio: evento.inicio,
    fim: evento.fim !== evento.inicio ? evento.fim : "",
    repeticao: evento.repeticao ?? "",
    repetirAte: evento.repetirAte ?? "",
    descricao: evento.descricao ?? "",
  };
}

export function EventoFormModal({ evento, dataInicial, onFechar, onSalvar }) {
  const [form, setForm] = useState(() => formularioInicial(evento, dataInicial));
  const [escopo, setEscopo] = useState("ESTE");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  const tipos = TIPOS.includes(form.tipo) ? TIPOS : [...TIPOS, form.tipo];
  const regraMudou =
    Boolean(evento) &&
    (form.repeticao !== (evento.repeticao ?? "") ||
      form.repetirAte !== (evento.repetirAte ?? ""));
  const escopoEfetivo = regraMudou && escopo === "ESTE" ? "SEGUINTES" : escopo;

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
    if (form.repeticao && form.repetirAte && form.repetirAte < form.inicio) {
      setErro("A repetição não pode terminar antes do início.");
      return;
    }
    if (form.repeticao && form.repetirAte > umAnoDepois(form.inicio)) {
      setErro("A repetição pode durar no máximo um ano. Deixe sem data final para repetir sem fim.");
      return;
    }

    setSalvando(true);
    try {
      await onSalvar(
        {
          nome: form.nome.trim(),
          tipo: form.tipo,
          dataInicio: form.inicio,
          dataFim: form.fim || form.inicio,
          descricao: form.descricao.trim() || null,
          repeticao: form.repeticao || null,
          repetirAte: (form.repeticao && form.repetirAte) || null,
        },
        escopoEfetivo
      );
    } catch (erroRequisicao) {
      setErro(
        erroRequisicao.response?.data?.erro ??
          "Não foi possível salvar o evento. Tente novamente."
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
              {evento ? "Editar evento" : "Adicionar evento"}
            </h2>
            <p className={`${modalStyles.subtitulo} ${styles.subtitulo}`}>
              {evento
                ? "As mudanças aparecem na agenda da tela de início."
                : "O evento aparece na agenda da tela de início."}
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
            {evento?.serie && (
              <div className={`${formStyles.campoSpan2} ${styles.escopo}`}>
                <EscolhaEscopo
                  legenda="Aplicar as mudanças a"
                  valor={escopoEfetivo}
                  onChange={setEscopo}
                  semEste={regraMudou}
                />
              </div>
            )}

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
                {tipos.map((tipo) => (
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

            <div className={formStyles.campo}>
              <Rotulo htmlFor="evento-repeticao" texto="Repetição" obrigatorio />
              <Select
                id="evento-repeticao"
                value={form.repeticao}
                onChange={(e) => alterar("repeticao", e.target.value)}
              >
                {REPETICOES.map(({ valor, rotulo }) => (
                  <option key={valor} value={valor}>
                    {rotulo}
                  </option>
                ))}
              </Select>
            </div>

            <div className={formStyles.campo}>
              <Rotulo htmlFor="evento-repetir-ate" texto="Repetir até" />
              <Input
                id="evento-repetir-ate"
                type="date"
                min={form.inicio}
                max={form.inicio ? umAnoDepois(form.inicio) : undefined}
                value={form.repetirAte}
                onChange={(e) => alterar("repetirAte", e.target.value)}
                disabled={!form.repeticao}
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
            texto={
              salvando
                ? "Salvando..."
                : evento
                  ? "Salvar alterações"
                  : "Adicionar evento"
            }
          />
        </footer>
      </div>
    </div>
  );
}

export default EventoFormModal;
