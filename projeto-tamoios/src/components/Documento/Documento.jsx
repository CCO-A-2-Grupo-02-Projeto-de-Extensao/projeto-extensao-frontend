import TextSnippetIcon from "@mui/icons-material/TextSnippet";
import styles from "../../styles/documento.module.css";
import api from "../../services/api";

export function Documento(props) {
  const handleClick = async () => {
    try {
      const response = await api.get("/documentos/1/visualizar", {
        responseType: "blob",
      });

      const pdfBlob = new Blob([response.data], {
        type: "application/pdf",
      });

      const pdfUrl = URL.createObjectURL(pdfBlob);

      window.open(pdfUrl, "_blank");

      setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
    } catch (error) {
      console.error("Erro ao visualizar o PDF:", error);
    }
  };

  return (
    <div className={styles.documento} onClick={handleClick}>
      <TextSnippetIcon className={styles.customIcon} />
      <p>{props.nome}</p>
    </div>
  );
}

export default Documento;
