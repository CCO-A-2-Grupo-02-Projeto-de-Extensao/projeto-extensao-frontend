import { useEffect, useMemo, useRef, useState } from "react";
import { Tooltip } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import CheckIcon from "@mui/icons-material/Check";
import { DocumentCard } from "../DocumentCard/DocumentCard.jsx";
import { UploadDocumentoModal } from "../UploadDocumentoModal/UploadDocumentoModal.jsx";
import { useCatalogos } from "../../hooks/useCatalogos.js";
import { useRolarParaErro } from "../../hooks/useRolarParaErro.js";
import { criarPessoa } from "../../services/membrosService.js";
import { enviarDocumento } from "../../services/documentosService.js";
import {
  CAMPO_NOME,
  DOCUMENTOS,
  calcularSpans,
  criarSecoesFormulario,
  removerResponsavel,
  renderCampo,
  renderResponsaveis,
  validarResponsaveis,
} from "../../utils/desbravadorForm.jsx";
import styles from "../../styles/cadastroDesbravadorModal.module.css";

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

export function CadastroDesbravadorModal({ aberto, onFechar, onCadastrar }) {
  const catalogos = useCatalogos();
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
  const [quantidadeResponsaveis, setQuantidadeResponsaveis] = useState(1);

  useRolarParaErro(campoComErro, tentativaErro);
  useRolarParaErro(erroSubmissao ? "submissao" : null, tentativaErro);

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
    ]
  );

  const ETAPAS = useMemo(() => {
    const formularioEtapas = secoesFormulario.map((secao) => ({ ...secao, tipo: "formulario" }));
    return [
      { titulo: "Foto e nome", tipo: "foto", campos: [CAMPO_NOME] },
      ...formularioEtapas,
      { titulo: "Responsáveis", tipo: "responsaveis" },
      { titulo: "Documentos", tipo: "documentos" },
    ];
  }, [secoesFormulario]);

  const primeiraEtapa = etapaAtual === 0;
  const ultimaEtapa = etapaAtual === ETAPAS.length - 1;
  const etapa = ETAPAS[Math.min(etapaAtual, ETAPAS.length - 1)];

  const fotoInputRef = useRef(null);
  const preservarArquivosRef = useRef(false);

  const fotoPreviewUrl = useMemo(
    () => (foto ? URL.createObjectURL(foto) : null),
    [foto]
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
    if (ETAPAS[indice]?.tipo === "responsaveis") {
      return !validarResponsaveis(formData, quantidadeResponsaveis);
    }
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

  const aoAdicionarResponsavel = () => {
    setQuantidadeResponsaveis((atual) => atual + 1);
    setErro("");
    setCampoComErro(null);
  };

  const aoRemoverResponsavel = (numero) => {
    setFormData((atual) => removerResponsavel(atual, numero, quantidadeResponsaveis));
    setQuantidadeResponsaveis((atual) => atual - 1);
    setErro("");
    setCampoComErro(null);
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
    setQuantidadeResponsaveis(1);
  };

  const aoFechar = () => {
    resetarTudo();
    onFechar();
  };

  const aoAvancar = () => {
    setTentativaErro((n) => n + 1);
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
    if (etapa.tipo === "responsaveis") {
      const resultado = validarResponsaveis(formData, quantidadeResponsaveis);
      if (resultado) {
        setErro(resultado.mensagem);
        setCampoComErro(resultado.campo);
        return;
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
    setTentativaErro((n) => n + 1);
    if (!formData.nome?.trim() || enviando) return;

    const erroResponsaveis = validarResponsaveis(formData, quantidadeResponsaveis);
    if (erroResponsaveis) {
      setEtapaAtual(ETAPAS.findIndex((item) => item.tipo === "responsaveis"));
      setErro(erroResponsaveis.mensagem);
      setCampoComErro(erroResponsaveis.campo);
      return;
    }

    setEnviando(true);
    setErroSubmissao("");

    try {
      const novoMembro = await criarPessoa(formData);

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
        dados?.erro ?? (dados && Object.values(dados)[0]) ??
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
            <h2 className={styles.titulo}>Cadastrar Desbravador</h2>
            <p className={styles.subtitulo}>
              Adicionar um novo desbravador ao clube.
            </p>
          </div>
          <div className={styles.stepperArea}>
            <div className={styles.stepper}>
              {ETAPAS.map((item, indice) => (
                <div key={item.titulo} className={styles.stepperItem}>
                  <Tooltip
                    title={item.titulo}
                    placement="top"
                    arrow
                    slotProps={TOOLTIP_SLOT_PROPS}
                  >
                    <div
                      role={etapaClicavel(indice) ? "button" : undefined}
                      tabIndex={etapaClicavel(indice) ? 0 : undefined}
                      className={`${styles.stepperCirculo} ${
                        indice === etapaAtual ? styles.stepperCirculoAtivo : ""
                      } ${indice < etapaAtual ? styles.stepperCirculoCompleto : ""} ${
                        etapaClicavel(indice) ? styles.stepperCirculoClicavel : ""
                      }`}
                      onClick={() => aoClicarEtapa(indice)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          aoClicarEtapa(indice);
                        }
                      }}
                    >
                      {indice < etapaAtual ? (
                        <CheckIcon sx={{ fontSize: 16 }} />
                      ) : (
                        indice + 1
                      )}
                    </div>
                  </Tooltip>
                  {indice < ETAPAS.length - 1 && (
                    <div
                      className={`${styles.stepperLinha} ${
                        indice < etapaAtual ? styles.stepperLinhaCompleta : ""
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <p className={styles.stepperLegenda}>
              Etapa {etapaAtual + 1} de {ETAPAS.length} · {etapa.titulo}
            </p>
          </div>
        </header>

        <div className={styles.corpo}>
          <div className={styles.painelWrapper}>
            {(etapa.tipo === "formulario" || etapa.tipo === "responsaveis") && (
              <p className={styles.camposLegenda}>
                <span className={styles.obrigatorio}>*</span> campos obrigatórios —
                os demais são opcionais.
              </p>
            )}

            {catalogos.carregandoCatalogos ? (
              <p className={styles.documentosSubtitulo}>Carregando formulário...</p>
            ) : etapa.tipo === "foto" ? (
              <section className={styles.secao}>
                <h3 className={styles.secaoTitulo}>Foto e nome</h3>
                <p className={styles.documentosSubtitulo}>
                  Adicione uma foto de perfil (opcional) e o nome completo do
                  desbravador.
                </p>
                <div className={styles.avatarArea}>
                  <div className={styles.avatarCirculo}>
                    {fotoPreviewUrl ? (
                      <img
                        src={fotoPreviewUrl}
                        alt="Pré-visualização da foto"
                        className={styles.avatarImagem}
                      />
                    ) : (
                      <PersonIcon sx={{ fontSize: 64, color: "var(--carvao)" }} />
                    )}
                  </div>
                  <input
                    ref={fotoInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => setFoto(e.target.files?.[0] ?? null)}
                  />
                  <button
                    type="button"
                    className={styles.botaoFoto}
                    onClick={() => fotoInputRef.current?.click()}
                  >
                    {foto ? "Trocar foto" : "Adicionar foto"}
                  </button>
                </div>
                <div className={styles.grid}>
                  {calcularSpans(etapa.campos).map((campo) =>
                    renderCampo(campo, formData, aoMudarCampo, erro, campoComErro, styles)
                  )}
                </div>
              </section>
            ) : etapa.tipo === "formulario" ? (
              <section className={styles.secao}>
                <h3 className={styles.secaoTitulo}>{etapa.titulo}</h3>
                <div className={styles.grid}>
                  {calcularSpans(etapa.campos).map((campo) =>
                    renderCampo(campo, formData, aoMudarCampo, erro, campoComErro, styles)
                  )}
                </div>
              </section>
            ) : etapa.tipo === "responsaveis" ? (
              <section className={styles.secao}>
                <h3 className={styles.secaoTitulo}>Responsáveis</h3>
                {renderResponsaveis({
                  formData,
                  quantidade: quantidadeResponsaveis,
                  onAdicionar: aoAdicionarResponsavel,
                  onRemover: aoRemoverResponsavel,
                  aoMudarCampo,
                  erro,
                  campoComErro,
                  styles,
                })}
              </section>
            ) : (
              <section className={styles.secao}>
                <h3 className={styles.secaoTitulo}>Documentos</h3>
                <p className={styles.documentosSubtitulo}>
                  Anexe os documentos do desbravador (opcional).
                </p>

                <div className={styles.documentosGrid}>
                  {DOCUMENTOS.map((documento) => (
                    <DocumentCard
                      key={documento.id}
                      titulo={documento.titulo}
                      arquivo={documents[documento.id] ?? null}
                      onEnviar={() => aoAbrirUpload(documento)}
                      onVisualizar={() =>
                        documents[documento.id] &&
                        window.open(documents[documento.id].url, "_blank")
                      }
                      onRemover={() => aoRemoverDocumento(documento.id)}
                    />
                  ))}
                </div>

                {erroSubmissao && (
                  <p
                    className={styles.campoErro}
                    style={{ marginTop: "16px" }}
                    data-erro="submissao"
                    tabIndex={-1}
                  >
                    {erroSubmissao}
                  </p>
                )}
              </section>
            )}
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
            {ultimaEtapa ? (enviando ? "Cadastrando..." : "Cadastrar Desbravador") : "Avançar"}
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

export default CadastroDesbravadorModal;
