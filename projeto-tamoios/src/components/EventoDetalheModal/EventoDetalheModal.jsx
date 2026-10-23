import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import RepeatIcon from "@mui/icons-material/Repeat";
import { Button } from "../Button/Button.jsx";
import modalStyles from "../../styles/uploadDocumentoModal.module.css";
import styles from "../../styles/eventoDetalheModal.module.css";

export function EventoDetalheModal({ evento, quando, repeticao, onFechar, onEditar, onExcluir }) {
  return (
    <div className={modalStyles.overlay} onMouseDown={onFechar}>
      <div
        className={`${modalStyles.modal} ${styles.modal}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="evento-detalhe-titulo"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className={modalStyles.cabecalho}>
          <div className={styles.textosCabecalho}>
            <h2 id="evento-detalhe-titulo" className={modalStyles.titulo}>
              {evento.titulo}
            </h2>
            <p className={styles.subtitulo}>
              {[evento.tipo, quando].filter(Boolean).join(" · ")}
            </p>
          </div>
          <Button variante="fechar" onClick={onFechar} aria-label="Fechar">
            <CloseIcon />
          </Button>
        </header>

        <div className={modalStyles.corpo}>
          {repeticao && (
            <p className={styles.repeticao}>
              <RepeatIcon fontSize="small" />
              {repeticao}
            </p>
          )}

          <h3 className={styles.rotulo}>Descrição</h3>
          <p className={evento.descricao ? styles.descricao : styles.semDescricao}>
            {evento.descricao || "Sem descrição."}
          </p>
        </div>

        <footer className={modalStyles.rodape}>
          <Button
            variante="perigo"
            className={styles.botaoRodape}
            icone={<DeleteOutlineIcon fontSize="small" />}
            onClick={onExcluir}
            texto="Excluir"
          />
          <Button
            variante="secundario"
            className={styles.botaoRodape}
            icone={<EditOutlinedIcon fontSize="small" />}
            onClick={onEditar}
            texto="Editar"
          />
        </footer>
      </div>
    </div>
  );
}

export default EventoDetalheModal;
