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

const somenteDigitos = (valor) => valor.replace(/\D/g, "");

function mascararTelefone(valor) {
  const digitos = somenteDigitos(valor).slice(0, 11);
  if (digitos.length > 10) {
    return digitos.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  if (digitos.length > 5) {
    return digitos.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
  }
  if (digitos.length > 2) {
    return digitos.replace(/(\d{2})(\d{0,5})/, "($1) $2");
  }
  return digitos.replace(/(\d{0,2})/, "($1");
}

function mascararCpf(valor) {
  return somenteDigitos(valor)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function mascararRg(valor) {
  return valor
    .toUpperCase()
    .replace(/[^0-9X]/g, "")
    .slice(0, 9)
    .replace(/(\d{2})(\w)/, "$1.$2")
    .replace(/(\d{3})(\w)/, "$1.$2")
    .replace(/(\d{3})([\dX]{1,2})$/, "$1-$2");
}

function telefoneValido(valor) {
  const digitos = somenteDigitos(valor);
  return digitos.length === 10 || digitos.length === 11;
}

function rgValido(valor) {
  return somenteDigitos(valor).length >= 7;
}

function cpfValido(valor) {
  const cpf = somenteDigitos(valor);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += Number(cpf[i]) * (10 - i);
  let digitoVerificador1 = (soma * 10) % 11;
  if (digitoVerificador1 === 10) digitoVerificador1 = 0;
  if (digitoVerificador1 !== Number(cpf[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += Number(cpf[i]) * (11 - i);
  let digitoVerificador2 = (soma * 10) % 11;
  if (digitoVerificador2 === 10) digitoVerificador2 = 0;
  return digitoVerificador2 === Number(cpf[10]);
}

function dataNascimentoValida(valor) {
  const data = new Date(valor);
  return !Number.isNaN(data.getTime()) && data <= new Date();
}

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
    titulo: "Foto",
    tipo: "foto",
  },
  {
    titulo: "Dados pessoais",
    tipo: "formulario",
    campos: [
      { name: "nome", label: "Nome completo", type: "text", span: 2, obrigatorio: true },
      {
        name: "dataNascimento",
        label: "Data de nascimento",
        type: "date",
        obrigatorio: true,
        validar: dataNascimentoValida,
        mensagemErro: "Data de nascimento inválida — não pode ser no futuro.",
      },
      { name: "genero", label: "Gênero", type: "select", opcoes: OPCOES_GENERO },
      {
        name: "telefone",
        label: "Telefone",
        type: "tel",
        mascara: mascararTelefone,
        validar: telefoneValido,
        mensagemErro: "Telefone inválido. Use o formato (00) 00000-0000.",
      },
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
      {
        name: "telefoneResponsavel1",
        label: "Telefone",
        type: "tel",
        mascara: mascararTelefone,
        validar: telefoneValido,
        mensagemErro: "Telefone inválido. Use o formato (00) 00000-0000.",
      },
      {
        name: "rgResponsavel1",
        label: "RG",
        type: "text",
        mascara: mascararRg,
        validar: rgValido,
        mensagemErro: "RG inválido.",
      },
      {
        name: "cpfResponsavel1",
        label: "CPF",
        type: "text",
        mascara: mascararCpf,
        validar: cpfValido,
        mensagemErro: "CPF inválido.",
      },
    ],
  },
  {
    titulo: "Responsável 2 (opcional)",
    tipo: "formulario",
    campos: [
      { name: "nomeResponsavel2", label: "Nome", type: "text", span: 2 },
      {
        name: "telefoneResponsavel2",
        label: "Telefone",
        type: "tel",
        mascara: mascararTelefone,
        validar: telefoneValido,
        mensagemErro: "Telefone inválido. Use o formato (00) 00000-0000.",
      },
      {
        name: "rgResponsavel2",
        label: "RG",
        type: "text",
        mascara: mascararRg,
        validar: rgValido,
        mensagemErro: "RG inválido.",
      },
      {
        name: "cpfResponsavel2",
        label: "CPF",
        type: "text",
        mascara: mascararCpf,
        validar: cpfValido,
        mensagemErro: "CPF inválido.",
      },
    ],
  },
  {
    titulo: "Documentos",
    tipo: "documentos",
  },
];

function renderCampo(campo, formData, aoMudarCampo, erro, campoComErro) {
  const valor = formData[campo.name] ?? "";
  const classeCampo = campo.span === 2 ? styles.campoSpan2 : styles.campo;
  const emErro = campo.name === campoComErro;

  return (
    <div key={campo.name} className={classeCampo}>
      <label className={styles.campoLabel} htmlFor={campo.name}>
        {campo.label}
        {campo.obrigatorio ? (
          <span className={styles.obrigatorio}> *</span>
        ) : (
          <span className={styles.opcional}> (opcional)</span>
        )}
      </label>

      {campo.type === "select" ? (
        <Select
          id={campo.name}
          value={valor}
          onChange={(e) => aoMudarCampo(campo, e.target.value)}
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
          onChange={(e) => aoMudarCampo(campo, e.target.value)}
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
  const [campoComErro, setCampoComErro] = useState(null);

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

  const aoMudarCampo = (campo, valorDigitado) => {
    const valor = campo.mascara ? campo.mascara(valorDigitado) : valorDigitado;
    setFormData((atual) => ({ ...atual, [campo.name]: valor }));
    if (campo.name === campoComErro) {
      setErro("");
      setCampoComErro(null);
    }
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
    setCampoComErro(null);
  };

  const aoFechar = () => {
    resetarTudo();
    onFechar();
  };

  const aoAvancar = () => {
    if (etapa.tipo === "formulario") {
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
            {etapa.tipo === "formulario" && (
              <p className={styles.camposLegenda}>
                <span className={styles.obrigatorio}>*</span> campos obrigatórios —
                os demais são opcionais.
              </p>
            )}

            {etapa.tipo === "foto" ? (
              <section className={styles.secao}>
                <h3 className={styles.secaoTitulo}>Foto do desbravador</h3>
                <p className={styles.documentosSubtitulo}>
                  Adicione uma foto de perfil (opcional).
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
              </section>
            ) : etapa.tipo === "formulario" ? (
              <section className={styles.secao}>
                <h3 className={styles.secaoTitulo}>{etapa.titulo}</h3>
                <div className={styles.grid}>
                  {etapa.campos.map((campo) =>
                    renderCampo(campo, formData, aoMudarCampo, erro, campoComErro)
                  )}
                </div>
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
