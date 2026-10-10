import { useEffect, useMemo, useRef, useState } from "react";
import { Tooltip } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import CheckIcon from "@mui/icons-material/Check";
import { DocumentCard } from "../DocumentCard/DocumentCard.jsx";
import { UploadDocumentoModal } from "../UploadDocumentoModal/UploadDocumentoModal.jsx";
import { useCatalogos } from "../../hooks/useCatalogos.js";
import { useRolarParaErro } from "../../hooks/useRolarParaErro.js";
import { criarPessoa, criarUsuario } from "../../services/membrosService.js";
import { enviarDocumento } from "../../services/documentosService.js";
import { criarEvento } from "../../services/chamadasService.js";
import {
  CAMPO_NOME,
  DOCUMENTOS,
  calcularSpans,
  criarSecoesFormulario,
  renderCampo,
} from "../../utils/desbravadorForm.jsx";
import styles from "../../styles/adicionarEventosModal.module.css";
import { CalendarioAcademico } from "../CalendarioAcademico/CalendarioAcademico.jsx";
import { Input } from "../Input/Input.jsx";
import EventIcon from "@mui/icons-material/Event";

function paraChaveData(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

const CAMPOS_ACESSO = [
  {
    name: "email",
    label: "E-mail de acesso",
    type: "email",
    obrigatorio: true,
    validar: (valor) => /\S+@\S+\.\S+/.test(valor),
    mensagemErro: "E-mail inválido.",
  },
  {
    name: "senha",
    label: "Senha",
    type: "password",
    obrigatorio: true,
    validar: (valor) => valor.length >= 6,
    mensagemErro: "A senha deve ter ao menos 6 caracteres.",
  },
];

const TOOLTIP_SLOT_PROPS = {
  tooltip: {
    sx: {
      backgroundColor: "var(--vinhoEscuro)",
      color: "var(--creme)",
      fontFamily: '"Fredoka", "Inter", sans-serif',
      fontSize: "13px",
      fontWeight: 600,
      padding: "6px 12px",
      borderRadius: "6px",
      boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.3)",
    },
  },
  arrow: {
    sx: { color: "var(--vinhoEscuro)" },
  },
};

export function AdicionarEventoModal({ aberto, onFechar, onCadastrar }) {
  const catalogos = useCatalogos();
  const [dataSelecionada, setDataSelecionada] = useState(() => new Date());
  const [formData, setFormData] = useState({});
  const [foto, setFoto] = useState(null);
  const [documents, setDocuments] = useState({});
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [etapaAtual, setEtapaAtual] = useState(0);
  const [etapasVisitadas, setEtapasVisitadas] = useState(() => new Set([0]));
  const [erro, setErro] = useState("");
  const [campoComErro, setCampoComErro] = useState(null);
  const [tentativaErro, setTentativaErro] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [erroSubmissao, setErroSubmissao] = useState("");
  const [controleAcademico, setControleAcademico] = useState(null);
  const [mesExibido, setMesExibido] = useState(() => {
    const hoje = new Date();
    return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  });
  const eventosDoDia =
    controleAcademico?.eventos.filter(
      (evento) => evento.data === paraChaveData(dataSelecionada),
    ) ?? [];

  const selecionarData = (data) => {
    setDataSelecionada(data);
    setMesExibido(new Date(data.getFullYear(), data.getMonth(), 1));
  };

  useRolarParaErro(campoComErro, tentativaErro);

  const cargoSelecionado = catalogos.cargos.find(
    (cargo) => String(cargo.id) === formData.cargo,
  );
  const precisaAcesso =
    Boolean(cargoSelecionado) && cargoSelecionado.nome !== "Desbravador";

  const aoFechar = () => {
    onFechar();
  };

  const aoCadastrar = async () => {
    setTentativaErro((n) => n + 1);
    const nomeEvento = formData.nome?.trim();
    if (!nomeEvento || enviando) return;

    setEnviando(true);
    setErroSubmissao("");

    try {
      const dataIso = paraChaveData(dataSelecionada);
      const descricaoEvento = [
        formData.horario ? `Horário: ${formData.horario}` : null,
        formData.repeticao ? `Repetição: ${formData.repeticao}` : null,
      ]
        .filter(Boolean)
        .join(" • ");

      const eventoCriado = await criarEvento({
        nome: nomeEvento,
        tipo: formData.tipo || "Reunião",
        dataInicio: dataIso,
        dataFim: dataIso,
        descricao: descricaoEvento || `Evento agendado para ${dataIso}`,
      });

      onCadastrar?.(eventoCriado);
      setFormData({});
      onFechar();
    } catch (erroRequisicao) {
      const dados = erroRequisicao.response?.data;
      const mensagem =
        dados?.erro ??
        (dados && Object.values(dados)[0]) ??
        "Não foi possível adicionar o evento. Tente novamente.";
      setErroSubmissao(mensagem);
    } finally {
      setEnviando(false);
    }
  };

  if (!aberto) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <header className={styles.cabecalho}>
          <div>
            <h2 className={styles.titulo}>Adicionar Eventos</h2>
            <p className={styles.subtitulo}>
              Adicionar um novo evento ao calendário.
            </p>
          </div>
        </header>

        <div className={styles.corpo}>
          <div className={styles.controleAdicionarEvento}>
            <div className={styles.painelCalendario}>
              <CalendarioAcademico
                mesExibido={mesExibido}
                dataSelecionada={dataSelecionada}
                onMudarMes={setMesExibido}
                onSelecionarData={selecionarData}
              />
            </div>

            <article className={styles.painel}>
              <header className={styles.cabecalhoPainel}>
                <EventIcon className={styles.iconePainel} aria-hidden="true" />
                <h3 className={styles.dataSelecionada}>
                  {dataSelecionada.toLocaleDateString("pt-BR")}
                </h3>
              </header>

              {eventosDoDia.length > 0 ? (
                <table
                  className={styles.tabelaEventos}
                  aria-label="Eventos do dia selecionado"
                >
                  <thead>
                    <tr>
                      <th>Horário</th>
                      <th>Evento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventosDoDia.map((evento) => (
                      <tr key={evento.id}>
                        <td>{evento.horario}</td>
                        <td>{evento.titulo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className={styles.semEventos}>Nenhum evento nesta data.</p>
              )}
            </article>
            <article className={styles.painelFormulario}>
              <form action="">
                <label className={styles.label}>Nome do Evento</label>
                <Input
                  type="text"
                  placeholder="Digite o nome do evento"
                  value={formData.nome || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
                />
                <label className={styles.label}>Horário</label>
                <Input
                  type="time"
                  placeholder="Digite o horário do evento"
                  value={formData.horario || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, horario: e.target.value })
                  }
                />
                <label className={styles.label}>Repetição</label>
                <select
                  value={formData.repeticao || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, repeticao: e.target.value })
                  }
                >
                  <option value="">Selecione</option>
                  <option value="diaria">Diária</option>
                  <option value="semanal">Semanal</option>
                  <option value="mensal">Mensal</option>
                  <option value="anual">Anual</option>
                </select>
              </form>
            </article>
          </div>
        </div>

        <footer className={styles.rodape}>
          <button
            type="button"
            className={styles.botaoCancelar}
            onClick={aoFechar}
            disabled={enviando}
          >
            {"Cancelar"}
          </button>
          <button
            type="button"
            className={styles.botaoCadastrar}
            onClick={aoCadastrar}
            disabled={enviando}
          >
            {enviando ? "Adicionando..." : "Adicionar Evento"}
          </button>
        </footer>
      </div>
    </div>
  );
}

export default AdicionarEventoModal;
