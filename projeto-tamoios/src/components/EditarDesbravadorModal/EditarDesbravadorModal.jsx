import { useEffect, useMemo, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import { DocumentCard } from "../DocumentCard/DocumentCard.jsx";
import { UploadDocumentoModal } from "../UploadDocumentoModal/UploadDocumentoModal.jsx";
import { useCatalogos } from "../../hooks/useCatalogos.js";
import { atualizarPessoa } from "../../services/membrosService.js";
import {
  enviarDocumento,
  listarDocumentosDaPessoa,
  removerDocumento,
  substituirDocumento,
} from "../../services/documentosService.js";
import {
  CAMPO_NOME,
  DOCUMENTOS,
  calcularSpans,
  criarSecoesFormulario,
  renderCampo,
  validarCampos,
} from "../../utils/desbravadorForm.jsx";
import styles from "../../styles/cadastroDesbravadorModal.module.css";

const DOCUMENTO_FOTO = { id: "foto", titulo: "Foto" };

export function EditarDesbravadorModal({ aberto, membro, onFechar, onSalvar }) {
  const catalogos = useCatalogos();
  const [formData, setFormData] = useState({});
  const [documents, setDocuments] = useState({});
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [erro, setErro] = useState("");
  const [campoComErro, setCampoComErro] = useState(null);
  const [salvando, setSalvando] = useState(false);

  const secoesFormulario = useMemo(
    () => criarSecoesFormulario(catalogos, formData),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- comparamos pelas listas em si, não pelo objeto novo a cada render
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

  useEffect(() => {
    if (aberto && membro) {
      setFormData({
        ...membro,
        cargo: membro.idCargo != null ? String(membro.idCargo) : "",
        classe: membro.idClasse != null ? String(membro.idClasse) : "",
        genero: membro.idGenero != null ? String(membro.idGenero) : "",
        unidade: membro.idUnidade != null ? String(membro.idUnidade) : "",
      });
      setErro("");
      setCampoComErro(null);
      listarDocumentosDaPessoa(membro.id).then(setDocuments);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só reabastece ao (re)abrir para o mesmo/outro membro
  }, [aberto, membro?.id]);

  const fotoPreviewUrl = documents.foto?.url ?? null;

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

  const aoSalvarDocumento = async (arquivo) => {
    const existente = documents[selectedDocument.id];
    const salvo = existente
      ? await substituirDocumento(existente.idDocumento, arquivo)
      : await enviarDocumento(membro.id, selectedDocument.id, arquivo);

    setDocuments((atual) => ({ ...atual, [selectedDocument.id]: salvo }));
    setIsUploadOpen(false);
    setSelectedDocument(null);
  };

  const aoRemoverDocumento = async (docId) => {
    const existente = documents[docId];
    if (!existente) return;
    await removerDocumento(existente.idDocumento);
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

  const aoSalvar = async () => {
    const todosCampos = [CAMPO_NOME, ...secoesFormulario.flatMap((s) => s.campos)];
    const resultado = validarCampos(todosCampos, formData);
    if (resultado) {
      setErro(resultado.mensagem);
      setCampoComErro(resultado.campo);
      return;
    }

    setSalvando(true);
    try {
      const membroAtualizado = await atualizarPessoa(membro.id, {
        ...formData,
        nome: formData.nome.trim(),
      });
      onSalvar?.({ ...membroAtualizado, documentacao: DOCUMENTOS.every((doc) => documents[doc.id]) });
      onFechar();
    } catch (erroRequisicao) {
      const dados = erroRequisicao.response?.data;
      setErro(dados?.erro ?? (dados && Object.values(dados)[0]) ?? "Não foi possível salvar as alterações.");
    } finally {
      setSalvando(false);
    }
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
                <button
                  type="button"
                  className={styles.botaoFoto}
                  onClick={() => aoAbrirUpload(DOCUMENTO_FOTO)}
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

            {secoesFormulario.map((secao) => (
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
                Anexe ou substitua os documentos do desbravador (opcional). Os
                arquivos são salvos assim que enviados.
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
            disabled={salvando}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={styles.botaoCadastrar}
            onClick={aoSalvar}
            disabled={salvando}
          >
            {salvando ? "Salvando..." : "Salvar alterações"}
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
