import { useEffect, useMemo, useRef, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import CheckIcon from "@mui/icons-material/Check";
import { Select } from "../Select/Select.jsx";
import { Input } from "../Input/Input.jsx";
import { DocumentCard } from "../DocumentCard/DocumentCard.jsx";
import { UploadDocumentoModal } from "../UploadDocumentoModal/UploadDocumentoModal.jsx";
import { CATEGORIAS } from "../../services/membrosService.js";
import styles from "../../styles/cadastroDesbravadorModal.module.css";

const OPCOES_CARGO = [
  { value: CATEGORIAS.ADMINISTRATIVO, label: "Administrativo" },
  { value: CATEGORIAS.INSTRUTOR, label: "Instrutor" },
  { value: CATEGORIAS.ALUNO, label: "Aluno" },
];

const OPCOES_GENERO = ["Masculino", "Feminino", "Prefiro não informar"].map(
  (valor) => ({ value: valor, label: valor })
);

const OPCOES_CLASSE = [
  "Amigo",
  "Companheiro",
  "Pesquisador",
  "Pioneiro",
  "Excursionista",
  "Guia",
].map((valor) => ({ value: valor, label: valor }));

const DOCUMENTOS = [
  { id: "certidaoNascimento", titulo: "Certidão de Nascimento" },
  { id: "cartaoSus", titulo: "Cartão SUS" },
  { id: "carteiraVacinacao", titulo: "Carteira de Vacinação" },
  { id: "carteiraConvenio", titulo: "Carteira do Convênio" },
  { id: "comprovanteEndereco", titulo: "Comprovante de Endereço" },
  { id: "fichaMedica", titulo: "Ficha Médica" },
  { id: "receitaMedica", titulo: "Receita Médica" },
  { id: "desempenhoEscolar", titulo: "Desempenho Escolar" },
  { id: "autorizacaoClube", titulo: "Autorização do Clube" },
];

const ETAPAS = [
  {
    titulo: "Dados pessoais",
    tipo: "formulario",
    campos: [
      { name: "nome", label: "Nome completo", type: "text", span: 2, obrigatorio: true },
      { name: "dataNascimento", label: "Data de nascimento", type: "date" },
      { name: "genero", label: "Gênero", type: "select", opcoes: OPCOES_GENERO },
      { name: "telefone", label: "Telefone", type: "tel" },
    ],
  },
  {
    titulo: "Informações do clube",
    tipo: "formulario",
    campos: [
      { name: "cargo", label: "Cargo", type: "select", opcoes: OPCOES_CARGO },
      { name: "classe", label: "Classe", type: "select", opcoes: OPCOES_CLASSE },
      { name: "unidade", label: "Unidade", type: "text" },
    ],
  },
  {
    titulo: "Dados escolares",
    tipo: "formulario",
    campos: [
      { name: "escola", label: "Escola", type: "text" },
      { name: "turma", label: "Turma", type: "text" },
    ],
  },
  {
    titulo: "Responsável 1",
    tipo: "formulario",
    campos: [
      { name: "nomeResponsavel1", label: "Nome", type: "text", span: 2 },
      { name: "telefoneResponsavel1", label: "Telefone", type: "tel" },
      { name: "rgResponsavel1", label: "RG", type: "text" },
      { name: "cpfResponsavel1", label: "CPF", type: "text" },
    ],
  },
  {
    titulo: "Responsável 2 (opcional)",
    tipo: "formulario",
    campos: [
      { name: "nomeResponsavel2", label: "Nome", type: "text", span: 2 },
      { name: "telefoneResponsavel2", label: "Telefone", type: "tel" },
      { name: "rgResponsavel2", label: "RG", type: "text" },
      { name: "cpfResponsavel2", label: "CPF", type: "text" },
    ],
  },
  {
    titulo: "Documentos",
    tipo: "documentos",
  },
];

function renderCampo(campo, formData, aoMudarCampo, erro) {
  const valor = formData[campo.name] ?? "";
  const classeCampo = campo.span === 2 ? styles.campoSpan2 : styles.campo;
  const emErro = Boolean(campo.obrigatorio && erro);

  return (
    <div key={campo.name} className={classeCampo}>
      <label className={styles.campoLabel} htmlFor={campo.name}>
        {campo.label}
        {campo.obrigatorio && <span className={styles.obrigatorio}> *</span>}
      </label>

      {campo.type === "select" ? (
        <Select
          id={campo.name}
          value={valor}
          onChange={(e) => aoMudarCampo(campo.name, e.target.value)}
        >
          <option value="">Selecione...</option>
          {campo.opcoes.map((opcao) => (
            <option key={opcao.value} value={opcao.value}>
              {opcao.label}
            </option>
          ))}
        </Select>
      ) : (
        <Input
          id={campo.name}
          type={campo.type}
          value={valor}
          onChange={(e) => aoMudarCampo(campo.name, e.target.value)}
          required={campo.obrigatorio}
          style={emErro ? { borderColor: "var(--vermelho)" } : undefined}
        />
      )}

      {emErro && <p className={styles.campoErro}>{erro}</p>}
    </div>
  );
}

export function CadastroDesbravadorModal({ aberto, onFechar, onCadastrar }) {
  const [formData, setFormData] = useState({});
  const [foto, setFoto] = useState(null);
  const [documents, setDocuments] = useState({});
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [etapaAtual, setEtapaAtual] = useState(0);
  const [erro, setErro] = useState("");

  const primeiraEtapa = etapaAtual === 0;
  const ultimaEtapa = etapaAtual === ETAPAS.length - 1;
  const etapa = ETAPAS[etapaAtual];

  const fotoInputRef = useRef(null);

  const fotoPreviewUrl = useMemo(
    () => (foto ? URL.createObjectURL(foto) : null),
    [foto]
  );

  useEffect(() => {
    return () => {
      if (fotoPreviewUrl) URL.revokeObjectURL(fotoPreviewUrl);
    };
  }, [fotoPreviewUrl]);

  const aoMudarCampo = (nome, valor) => {
    setFormData((atual) => ({ ...atual, [nome]: valor }));
    if (nome === "nome" && erro) setErro("");
  };

  const resetarTudo = () => {
    setFormData({});
    setFoto(null);
    setDocuments((atual) => {
      Object.values(atual).forEach((doc) => URL.revokeObjectURL(doc.url));
      return {};
    });
    setSelectedDocument(null);
    setIsUploadOpen(false);
    setEtapaAtual(0);
    setErro("");
  };

  const aoFechar = () => {
    resetarTudo();
    onFechar();
  };

  const aoAvancar = () => {
    if (primeiraEtapa && !formData.nome?.trim()) {
      setErro("Preencha o nome completo para continuar.");
      return;
    }
    setErro("");
    setEtapaAtual((atual) => Math.min(atual + 1, ETAPAS.length - 1));
  };

  const aoVoltar = () => {
    setErro("");
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

  const aoCadastrar = () => {
    if (!formData.nome?.trim()) return;

    const categoria = formData.cargo || CATEGORIAS.ALUNO;
    const rotuloCargo =
      OPCOES_CARGO.find((opcao) => opcao.value === categoria)?.label ?? "Aluno";

    const novoMembro = {
      ...formData,
      nome: formData.nome.trim(),
      categoria,
      papel: formData.classe || rotuloCargo,
      documentacao: DOCUMENTOS.every((doc) => documents[doc.id]),
      ativo: true,
    };

    console.log(novoMembro, documents);
    onCadastrar?.(novoMembro);
    aoFechar();
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
          <button
            type="button"
            className={styles.botaoFechar}
            onClick={aoFechar}
            aria-label="Fechar"
          >
            <CloseIcon />
          </button>
        </header>

        <div className={styles.corpo}>
          <div className={styles.painelWrapper}>
            <div className={styles.stepper}>
              {ETAPAS.map((item, indice) => (
                <div key={item.titulo} className={styles.stepperItem}>
                  <div
                    className={`${styles.stepperCirculo} ${
                      indice === etapaAtual ? styles.stepperCirculoAtivo : ""
                    } ${indice < etapaAtual ? styles.stepperCirculoCompleto : ""}`}
                  >
                    {indice < etapaAtual ? (
                      <CheckIcon sx={{ fontSize: 16 }} />
                    ) : (
                      indice + 1
                    )}
                  </div>
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

            {etapa.tipo === "formulario" ? (
              <>
                {primeiraEtapa && (
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
                )}

                <section className={styles.secao}>
                  <h3 className={styles.secaoTitulo}>{etapa.titulo}</h3>
                  <div className={styles.grid}>
                    {etapa.campos.map((campo) =>
                      renderCampo(campo, formData, aoMudarCampo, erro)
                    )}
                  </div>
                </section>
              </>
            ) : (
              <section className={styles.secao}>
                <h3 className={styles.secaoTitulo}>Documentos</h3>
                <p className={styles.documentosSubtitulo}>
                  Anexe os documentos do desbravador.
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
              </section>
            )}
          </div>
        </div>

        <footer className={styles.rodape}>
          <button
            type="button"
            className={styles.botaoCancelar}
            onClick={primeiraEtapa ? aoFechar : aoVoltar}
          >
            {primeiraEtapa ? "Cancelar" : "Voltar"}
          </button>
          <button
            type="button"
            className={styles.botaoCadastrar}
            onClick={ultimaEtapa ? aoCadastrar : aoAvancar}
          >
            {ultimaEtapa ? "Cadastrar Desbravador" : "Avançar"}
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
