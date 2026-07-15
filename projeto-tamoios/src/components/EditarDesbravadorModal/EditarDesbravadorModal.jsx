import { useEffect, useRef, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import { DocumentCard } from "../DocumentCard/DocumentCard.jsx";
import { UploadDocumentoModal } from "../UploadDocumentoModal/UploadDocumentoModal.jsx";
import { CATEGORIAS } from "../../services/membrosService.js";
import {
  CAMPO_NOME,
  DOCUMENTOS,
  SECOES_FORMULARIO,
  calcularSpans,
  renderCampo,
  rotuloCargo,
  validarCampos,
} from "../../utils/desbravadorForm.jsx";
import styles from "../../styles/cadastroDesbravadorModal.module.css";

export function EditarDesbravadorModal({ aberto, membro, onFechar, onSalvar }) {
  const [formData, setFormData] = useState({});
  const [foto, setFoto] = useState(null);
  const [fotoUrlExistente, setFotoUrlExistente] = useState(null);
  const [documents, setDocuments] = useState({});
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [erro, setErro] = useState("");
  const [campoComErro, setCampoComErro] = useState(null);

  const fotoInputRef = useRef(null);

  useEffect(() => {
    if (aberto && membro) {
      setFormData({ ...membro });
      setFoto(null);
      setFotoUrlExistente(membro.fotoUrl ?? null);
      setDocuments(membro.documentos ?? {});
      setErro("");
      setCampoComErro(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só reabastece ao (re)abrir para o mesmo/outro membro
  }, [aberto, membro?.id]);

  const fotoPreviewUrl = foto ? URL.createObjectURL(foto) : fotoUrlExistente;

  const aoMudarCampo = (campo, valorDigitado) => {
    const valor = campo.mascara ? campo.mascara(valorDigitado) : valorDigitado;
    setFormData((atual) => ({ ...atual, [campo.name]: valor }));
    if (campo.name === campoComErro) {
      setErro("");
      setCampoComErro(null);
    }
  };

  const aoAbrirUpload = (documento) => {
    setSelectedDocument(documento);
    setIsUploadOpen(true);
  };

  const aoSalvarDocumento = (arquivo) => {
    setDocuments((atual) => ({
      ...atual,
      [selectedDocument.id]: {
        nome: arquivo.name,
        tamanho: arquivo.size,
        tipo: arquivo.type,
        url: URL.createObjectURL(arquivo),
      },
    }));
    setIsUploadOpen(false);
    setSelectedDocument(null);
  };

  const aoRemoverDocumento = (docId) => {
    setDocuments((atual) => {
      const copia = { ...atual };
      delete copia[docId];
      return copia;
    });
  };

  const aoCancelar = () => {
    setIsUploadOpen(false);
    setSelectedDocument(null);
    onFechar();
  };

  const aoSalvar = () => {
    const todosCampos = [CAMPO_NOME, ...SECOES_FORMULARIO.flatMap((s) => s.campos)];
    const resultado = validarCampos(todosCampos, formData);
    if (resultado) {
      setErro(resultado.mensagem);
      setCampoComErro(resultado.campo);
      return;
    }

    const categoria = formData.cargo || CATEGORIAS.ALUNO;

    const membroAtualizado = {
      ...membro,
      ...formData,
      nome: formData.nome.trim(),
      categoria,
      papel: formData.classe || rotuloCargo(categoria),
      documentacao: DOCUMENTOS.every((doc) => documents[doc.id]),
      documentos: documents,
      fotoUrl: fotoPreviewUrl,
    };

    onSalvar?.(membroAtualizado);
    onFechar();
  };

  if (!aberto || !membro) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <header className={styles.cabecalho}>
          <div>
            <h2 className={styles.titulo}>Editar Desbravador</h2>
            <p className={styles.subtitulo}>Atualize as informações do membro.</p>
          </div>
          <button
            type="button"
            className={styles.botaoFechar}
            onClick={aoCancelar}
            aria-label="Fechar"
          >
            <CloseIcon />
          </button>
        </header>

        <div className={styles.corpo}>
          <div className={styles.painelWrapper}>
            <p className={styles.camposLegenda}>
              <span className={styles.obrigatorio}>*</span> campos obrigatórios —
              os demais são opcionais.
            </p>

            <section className={styles.secao}>
              <h3 className={styles.secaoTitulo}>Foto e nome</h3>
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
                  {fotoPreviewUrl ? "Trocar foto" : "Adicionar foto"}
                </button>
              </div>
              <div className={styles.grid}>
                {calcularSpans([CAMPO_NOME]).map((campo) =>
                  renderCampo(campo, formData, aoMudarCampo, erro, campoComErro, styles)
                )}
              </div>
            </section>

            {SECOES_FORMULARIO.map((secao) => (
              <section key={secao.titulo} className={styles.secao}>
                <h3 className={styles.secaoTitulo}>{secao.titulo}</h3>
                <div className={styles.grid}>
                  {calcularSpans(secao.campos).map((campo) =>
                    renderCampo(campo, formData, aoMudarCampo, erro, campoComErro, styles)
                  )}
                </div>
              </section>
            ))}

            <section className={styles.secao}>
              <h3 className={styles.secaoTitulo}>Documentos</h3>
              <p className={styles.documentosSubtitulo}>
                Anexe ou substitua os documentos do desbravador (opcional).
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
          </div>
        </div>

        <footer className={styles.rodape}>
          <button
            type="button"
            className={styles.botaoCancelar}
            onClick={aoCancelar}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={styles.botaoCadastrar}
            onClick={aoSalvar}
          >
            Salvar alterações
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

export default EditarDesbravadorModal;
