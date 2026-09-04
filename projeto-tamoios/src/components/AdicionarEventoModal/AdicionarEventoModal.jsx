import { useEffect, useMemo, useRef, useState } from "react";
import { Tooltip } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import CheckIcon from "@mui/icons-material/Check";
import { DocumentCard } from "../DocumentCard/DocumentCard.jsx";
import { UploadDocumentoModal } from "../UploadDocumentoModal/UploadDocumentoModal.jsx";
import { useCatalogos } from "../../hooks/useCatalogos.js";
import { criarPessoa, criarUsuario } from "../../services/membrosService.js";
import { enviarDocumento } from "../../services/documentosService.js";
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

  const secoesFormulario = useMemo(
    () => criarSecoesFormulario(catalogos, formData),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- catalogos é um objeto novo a cada render; comparamos pelas listas em si
    [
      catalogos.cargos,
      catalogos.classes,
      catalogos.generos,
      catalogos.unidades,
      formData.genero,
      formData.dataNascimento,
      formData.unidade,
    ],
  );

  const cargoSelecionado = catalogos.cargos.find(
    (cargo) => String(cargo.id) === formData.cargo,
  );
  const precisaAcesso =
    Boolean(cargoSelecionado) && cargoSelecionado.nome !== "Desbravador";

  const ETAPAS = useMemo(() => {
    const formularioEtapas = secoesFormulario.map((secao) => ({
      ...secao,
      tipo: "formulario",
    }));
    const etapas = [
      { titulo: "Foto e nome", tipo: "foto", campos: [CAMPO_NOME] },
      ...formularioEtapas.slice(0, 2),
    ];
    if (precisaAcesso) {
      etapas.push({
        titulo: "Acesso ao sistema",
        tipo: "formulario",
        campos: CAMPOS_ACESSO,
      });
    }
    etapas.push(...formularioEtapas.slice(2), {
      titulo: "Documentos",
      tipo: "documentos",
    });
    return etapas;
  }, [secoesFormulario, precisaAcesso]);

  const primeiraEtapa = etapaAtual === 0;
  const ultimaEtapa = etapaAtual === ETAPAS.length - 1;
  const etapa = ETAPAS[Math.min(etapaAtual, ETAPAS.length - 1)];

  const fotoInputRef = useRef(null);
  const preservarArquivosRef = useRef(false);

  const fotoPreviewUrl = useMemo(
    () => (foto ? URL.createObjectURL(foto) : null),
    [foto],
  );

  useEffect(() => {
    return () => {
      if (fotoPreviewUrl && !preservarArquivosRef.current) {
        URL.revokeObjectURL(fotoPreviewUrl);
      }
      preservarArquivosRef.current = false;
    };
  }, [fotoPreviewUrl]);

  useEffect(() => {
    setEtapasVisitadas((atual) => {
      if (atual.has(etapaAtual)) return atual;
      return new Set(atual).add(etapaAtual);
    });
  }, [etapaAtual]);

  // Uma etapa só vira atalho clicável depois que o usuário passou por ela
  // pelo menos uma vez e os campos obrigatórios dela já estão preenchidos —
  // assim ele pode pular de volta sem risco de "perder o lugar".
  const etapaClicavel = (indice) => {
    if (!etapasVisitadas.has(indice)) return false;
    const campos = ETAPAS[indice]?.campos;
    if (!campos) return true;
    return campos.every((campo) => {
      if (!campo.obrigatorio) return true;
      return String(formData[campo.name] ?? "").trim() !== "";
    });
  };

  const aoClicarEtapa = (indice) => {
    if (indice === etapaAtual || !etapaClicavel(indice)) return;
    setErro("");
    setCampoComErro(null);
    setEtapaAtual(indice);
  };

  const aoMudarCampo = (campo, valorDigitado) => {
    const valor = campo.mascara ? campo.mascara(valorDigitado) : valorDigitado;
    setFormData((atual) => ({ ...atual, [campo.name]: valor }));
    if (campo.name === campoComErro) {
      setErro("");
      setCampoComErro(null);
    }
  };

  const resetarTudo = (manterArquivos = false) => {
    if (manterArquivos) preservarArquivosRef.current = true;
    setFormData({});
    setFoto(null);
    setDocuments((atual) => {
      if (!manterArquivos) {
        Object.values(atual).forEach((doc) => URL.revokeObjectURL(doc.url));
      }
      return {};
    });
    setSelectedDocument(null);
    setIsUploadOpen(false);
    setEtapaAtual(0);
    setEtapasVisitadas(new Set([0]));
    setErro("");
    setCampoComErro(null);
    setErroSubmissao("");
  };

  const aoFechar = () => {
    resetarTudo();
    onFechar();
  };

  const aoAvancar = () => {
    if (etapa.campos) {
      for (const campo of etapa.campos) {
        const valor = String(formData[campo.name] ?? "").trim();

        if (campo.obrigatorio && !valor) {
          setErro(`Preencha o campo "${campo.label}" para continuar.`);
          setCampoComErro(campo.name);
          return;
        }

        if (valor && campo.validar && !campo.validar(valor)) {
          setErro(campo.mensagemErro ?? `Campo "${campo.label}" inválido.`);
          setCampoComErro(campo.name);
          return;
        }
      }
    }
    setErro("");
    setCampoComErro(null);
    setEtapaAtual((atual) => Math.min(atual + 1, ETAPAS.length - 1));
  };

  const aoVoltar = () => {
    setErro("");
    setCampoComErro(null);
    setEtapaAtual((atual) => Math.max(atual - 1, 0));
  };

  const aoAbrirUpload = (documento) => {
    setSelectedDocument(documento);
    setIsUploadOpen(true);
  };

  const aoSalvarDocumento = (arquivo) => {
    setDocuments((atual) => {
      if (atual[selectedDocument.id]?.url) {
        URL.revokeObjectURL(atual[selectedDocument.id].url);
      }
      return {
        ...atual,
        [selectedDocument.id]: {
          arquivo,
          nome: arquivo.name,
          tamanho: arquivo.size,
          tipo: arquivo.type,
          url: URL.createObjectURL(arquivo),
        },
      };
    });
    setIsUploadOpen(false);
    setSelectedDocument(null);
  };

  const aoRemoverDocumento = (docId) => {
    setDocuments((atual) => {
      const copia = { ...atual };
      if (copia[docId]?.url) URL.revokeObjectURL(copia[docId].url);
      delete copia[docId];
      return copia;
    });
  };

  const aoCadastrar = async () => {
    if (!formData.nome?.trim() || enviando) return;

    setEnviando(true);
    setErroSubmissao("");

    try {
      const novoMembro = await criarPessoa(formData);

      if (precisaAcesso) {
        await criarUsuario({
          idPessoa: novoMembro.id,
          idCargo: Number(formData.cargo),
          email: formData.email,
          senha: formData.senha,
        });
      }

      if (foto) {
        await enviarDocumento(novoMembro.id, "foto", foto);
      }

      for (const documento of DOCUMENTOS) {
        const arquivo = documents[documento.id]?.arquivo;
        if (arquivo) {
          await enviarDocumento(novoMembro.id, documento.id, arquivo);
        }
      }

      onCadastrar?.(novoMembro);
      resetarTudo(true);
      onFechar();
    } catch (erroRequisicao) {
      const dados = erroRequisicao.response?.data;
      const mensagem =
        dados?.erro ??
        (dados && Object.values(dados)[0]) ??
        "Não foi possível cadastrar o desbravador. Tente novamente.";
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
            onClick={primeiraEtapa ? aoFechar : aoVoltar}
            disabled={enviando}
          >
            {primeiraEtapa ? "Cancelar" : "Voltar"}
          </button>
          <button
            type="button"
            className={styles.botaoCadastrar}
            onClick={ultimaEtapa ? aoCadastrar : aoAvancar}
            disabled={enviando || catalogos.carregandoCatalogos}
          >
            {ultimaEtapa
              ? enviando
                ? "Cadastrando..."
                : "Cadastrar Desbravador"
              : "Adicionar Evento"}
          </button>
        </footer>
      </div>

      <UploadDocumentoModal
        aberto={isUploadOpen}
        documento={selectedDocument}
        onFechar={() => setIsUploadOpen(false)}
        onSalvar={aoSalvarDocumento}
      />
    </div>
  );
}

export default AdicionarEventoModal;
