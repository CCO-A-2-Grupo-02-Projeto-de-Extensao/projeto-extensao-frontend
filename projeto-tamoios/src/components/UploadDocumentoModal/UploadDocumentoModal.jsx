import { useEffect, useMemo, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import styles from "../../styles/uploadDocumentoModal.module.css";

function formatarTamanho(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UploadDocumentoModal({ aberto, documento, onFechar, onSalvar }) {
  const [arquivo, setArquivo] = useState(null);
  const [arrastando, setArrastando] = useState(false);

  const previewUrl = useMemo(
    () => (arquivo ? URL.createObjectURL(arquivo) : null),
    [arquivo]
  );

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const limparEFechar = () => {
    setArquivo(null);
    setArrastando(false);
    onFechar();
  };

  const aoSoltar = (e) => {
    e.preventDefault();
    setArrastando(false);
    const arquivoSolto = e.dataTransfer.files?.[0];
    if (arquivoSolto) setArquivo(arquivoSolto);
  };

  const aoSalvar = () => {
    if (!arquivo) return;
    onSalvar(arquivo);
    setArquivo(null);
  };

  if (!aberto || !documento) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <header className={styles.cabecalho}>
          <div>
            <h2 className={styles.titulo}>Enviar Documento</h2>
            <p className={styles.subtitulo}>{documento.titulo}</p>
          </div>
          <button
            type="button"
            className={styles.botaoFechar}
            onClick={limparEFechar}
            aria-label="Fechar"
          >
            <CloseIcon />
          </button>
        </header>

        <div className={styles.corpo}>
          {!arquivo ? (
            <label
              className={`${styles.areaUpload} ${
                arrastando ? styles.areaUploadAtiva : ""
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setArrastando(true);
              }}
              onDragLeave={() => setArrastando(false)}
              onDrop={aoSoltar}
            >
              <UploadFileIcon sx={{ fontSize: 40, color: "var(--vinhoEscuro)" }} />
              <p className={styles.areaUploadTexto}>
                Arraste o arquivo aqui ou <span>selecione um arquivo</span>
              </p>
              <input
                type="file"
                className={styles.inputOculto}
                onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
              />
            </label>
          ) : (
            <div className={styles.preview}>
              <div className={styles.previewVisual}>
                {arquivo.type.startsWith("image/") ? (
                  <img
                    src={previewUrl}
                    alt={arquivo.name}
                    className={styles.previewImagem}
                  />
                ) : arquivo.type === "application/pdf" ? (
                  <embed
                    src={previewUrl}
                    type="application/pdf"
                    className={styles.previewPdf}
                  />
                ) : (
                  <InsertDriveFileIcon sx={{ fontSize: 56, color: "var(--carvao)" }} />
                )}
              </div>

              <div className={styles.previewInfo}>
                <p className={styles.previewNome}>{arquivo.name}</p>
                <p className={styles.previewMeta}>
                  {arquivo.type || "Tipo desconhecido"} · {formatarTamanho(arquivo.size)}
                </p>
                <button
                  type="button"
                  className={styles.botaoTrocarArquivo}
                  onClick={() => setArquivo(null)}
                >
                  Escolher outro arquivo
                </button>
              </div>
            </div>
          )}
        </div>

        <footer className={styles.rodape}>
          <button type="button" className={styles.botaoCancelar} onClick={limparEFechar}>
            Cancelar
          </button>
          <button
            type="button"
            className={styles.botaoSalvar}
            onClick={aoSalvar}
            disabled={!arquivo}
          >
            Salvar Documento
          </button>
        </footer>
      </div>
    </div>
  );
}

export default UploadDocumentoModal;
