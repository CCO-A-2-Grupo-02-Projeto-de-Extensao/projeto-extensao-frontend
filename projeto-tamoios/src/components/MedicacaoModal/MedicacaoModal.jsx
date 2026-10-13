import { useEffect, useRef, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { Button } from "../Button/Button.jsx";
import { Input } from "../Input/Input.jsx";
import { Select } from "../Select/Select.jsx";
import {
  DIAS_SEMANA,
  UNIDADES_DOSE,
  listarNomesMedicamentos,
} from "../../services/medicacoesService.js";
import modalStyles from "../../styles/uploadDocumentoModal.module.css";
import styles from "../../styles/medicacaoModal.module.css";
import formStyles from "../../styles/cadastroDesbravadorModal.module.css";

const MEDICACAO_VAZIA = {
  nome: "",
  dose: "",
  unidadeDose: "",
  dias: [],
  horarios: [""],
  inicio: "",
  fim: "",
  observacoes: "",
  receita: null,
};

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

export function MedicacaoModal({ medicacao, arquivoReceitaInicial, onFechar, onSalvar }) {
  const [form, setForm] = useState(() => {
    const inicial = { ...MEDICACAO_VAZIA, ...medicacao };
    return inicial.horarios.length ? inicial : { ...inicial, horarios: [""] };
  });
  const [arquivoReceita, setArquivoReceita] = useState(arquivoReceitaInicial ?? null);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [nomesSugeridos, setNomesSugeridos] = useState([]);
  const receitaInputRef = useRef(null);

  useEffect(() => {
    let ativo = true;
    listarNomesMedicamentos()
      .then((nomes) => {
        if (ativo) setNomesSugeridos(nomes);
      })
      .catch(() => {});
    return () => {
      ativo = false;
    };
  }, []);

  const editando = Boolean(medicacao?.id || medicacao?.nome);
  const todosOsDias = form.dias.length === DIAS_SEMANA.length;
  const nomeReceita = arquivoReceita?.name ?? form.receita?.nome;

  const alterar = (campo, valor) => {
    setForm((atual) => ({ ...atual, [campo]: valor }));
    setErro("");
  };

  const alternarDia = (id) =>
    alterar(
      "dias",
      form.dias.includes(id)
        ? form.dias.filter((dia) => dia !== id)
        : DIAS_SEMANA.map((dia) => dia.id).filter((dia) => dia === id || form.dias.includes(dia))
    );

  const alterarHorario = (indice, valor) =>
    alterar("horarios", form.horarios.map((horario, i) => (i === indice ? valor : horario)));

  const removerHorario = (indice) => {
    const restantes = form.horarios.filter((_, i) => i !== indice);
    alterar("horarios", restantes.length ? restantes : [""]);
  };

  const removerReceita = () => {
    setArquivoReceita(null);
    alterar("receita", null);
  };

  const aoSalvar = async () => {
    if (!form.nome.trim()) {
      setErro("Informe o nome do medicamento.");
      return;
    }
    if (form.inicio && form.fim && form.fim < form.inicio) {
      setErro("O término não pode ser antes do início.");
      return;
    }

    setSalvando(true);
    try {
      await onSalvar(
        { ...form, nome: form.nome.trim(), horarios: form.horarios.filter(Boolean) },
        arquivoReceita
      );
    } catch (erroRequisicao) {
      setErro(
        erroRequisicao.response?.data?.erro ?? "Não foi possível salvar a medicação. Tente novamente."
      );
      setSalvando(false);
    }
  };

  return (
    <div className={modalStyles.overlay}>
      <div className={`${modalStyles.modal} ${styles.modal}`} role="dialog" aria-labelledby="medicacao-titulo">
        <header className={modalStyles.cabecalho}>
          <div>
            <h2 id="medicacao-titulo" className={modalStyles.titulo}>
              {editando ? "Editar medicação" : "Adicionar medicação"}
            </h2>
            <p className={`${modalStyles.subtitulo} ${styles.subtitulo}`}>Remédio, dosagem, dias, horários e receita.</p>
          </div>
          <Button
            variante="fechar"
            className={styles.botaoFechar}
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
              <Rotulo htmlFor="medicacao-nome" texto="Nome do medicamento" obrigatorio />
              <Input
                id="medicacao-nome"
                list="medicacao-nomes"
                value={form.nome}
                onChange={(e) => alterar("nome", e.target.value)}
                autoFocus
              />
              <datalist id="medicacao-nomes">
                {nomesSugeridos.map((nome) => (
                  <option key={nome} value={nome} />
                ))}
              </datalist>
            </div>

            <div className={formStyles.campo}>
              <Rotulo htmlFor="medicacao-dose" texto="Dose" />
              <Input
                id="medicacao-dose"
                type="number"
                min="0"
                step="any"
                value={form.dose}
                onChange={(e) => alterar("dose", e.target.value)}
              />
            </div>

            <div className={formStyles.campo}>
              <Rotulo htmlFor="medicacao-unidade" texto="Unidade" />
              <Select
                id="medicacao-unidade"
                value={form.unidadeDose}
                onChange={(e) => alterar("unidadeDose", e.target.value)}
              >
                <option value="">Selecione...</option>
                {UNIDADES_DOSE.map((unidade) => (
                  <option key={unidade} value={unidade}>
                    {unidade}
                  </option>
                ))}
              </Select>
            </div>

            <div className={formStyles.campoSpan2}>
              <span className={formStyles.campoLabel}>
                Dias da semana<span className={formStyles.opcional}> (opcional)</span>
              </span>
              <div className={styles.dias} role="group" aria-label="Dias da semana">
                {DIAS_SEMANA.map((dia) => (
                  <Button
                    key={dia.id}
                    variante={form.dias.includes(dia.id) ? "primario" : "secundario"}
                    compacto
                    className={styles.dia}
                    aria-pressed={form.dias.includes(dia.id)}
                    onClick={() => alternarDia(dia.id)}
                    texto={dia.rotulo}
                  />
                ))}
              </div>
              <button
                type="button"
                className={styles.atalhoDias}
                onClick={() =>
                  alterar("dias", todosOsDias ? [] : DIAS_SEMANA.map((dia) => dia.id))
                }
              >
                {todosOsDias ? "Limpar dias" : "Todos os dias"}
              </button>
            </div>

            <div className={formStyles.campoSpan2}>
              <span className={formStyles.campoLabel}>
                Horários<span className={formStyles.opcional}> (opcional)</span>
              </span>
              <div className={styles.horarios}>
                {form.horarios.map((horario, indice) => (
                  <div key={indice} className={styles.horario}>
                    <Input
                      type="time"
                      value={horario}
                      aria-label={`Horário ${indice + 1}`}
                      onChange={(e) => alterarHorario(indice, e.target.value)}
                    />
                    {form.horarios.length > 1 && (
                      <Button
                        variante="fechar"
                        onClick={() => removerHorario(indice)}
                        aria-label={`Remover horário ${indice + 1}`}
                        texto="×"
                      />
                    )}
                  </div>
                ))}
                <Button
                  variante="secundario"
                  compacto
                  className={styles.textoPequeno}
                  onClick={() => alterar("horarios", [...form.horarios, ""])}
                  texto="Adicionar horário"
                />
              </div>
            </div>

            <div className={formStyles.campo}>
              <Rotulo htmlFor="medicacao-inicio" texto="Início" />
              <Input
                id="medicacao-inicio"
                type="date"
                value={form.inicio}
                onChange={(e) => alterar("inicio", e.target.value)}
              />
            </div>

            <div className={formStyles.campo}>
              <Rotulo htmlFor="medicacao-fim" texto="Término" />
              <Input
                id="medicacao-fim"
                type="date"
                value={form.fim}
                min={form.inicio || undefined}
                onChange={(e) => alterar("fim", e.target.value)}
              />
              <span className={styles.ajuda}>Em branco para uso contínuo.</span>
            </div>

            <div className={formStyles.campoSpan2}>
              <Rotulo htmlFor="medicacao-observacoes" texto="Observações" />
              <Input
                id="medicacao-observacoes"
                maxLength={255}
                placeholder="Ex.: tomar após a refeição"
                value={form.observacoes}
                onChange={(e) => alterar("observacoes", e.target.value)}
              />
            </div>

            <div className={formStyles.campoSpan2}>
              <span className={formStyles.campoLabel}>
                Receita<span className={formStyles.opcional}> (opcional)</span>
              </span>
              <div className={styles.receita}>
                {nomeReceita ? (
                  <span className={styles.receitaNome}>{nomeReceita}</span>
                ) : (
                  <span className={styles.receitaVazia}>Nenhuma receita anexada.</span>
                )}
                <input
                  ref={receitaInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  className={styles.inputOculto}
                  onChange={(e) => {
                    const arquivo = e.target.files?.[0];
                    if (arquivo) setArquivoReceita(arquivo);
                    e.target.value = "";
                  }}
                />
                <Button
                  variante="secundario"
                  compacto
                  className={styles.textoPequeno}
                  onClick={() => receitaInputRef.current?.click()}
                  texto={nomeReceita ? "Trocar" : "Anexar receita"}
                />
                {nomeReceita && (
                  <Button
                    variante="perigo"
                    compacto
                    className={styles.textoPequeno}
                    onClick={removerReceita}
                    texto="Remover"
                  />
                )}
              </div>
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
            texto={salvando ? "Salvando..." : "Salvar medicação"}
          />
        </footer>
      </div>
    </div>
  );
}

export default MedicacaoModal;
