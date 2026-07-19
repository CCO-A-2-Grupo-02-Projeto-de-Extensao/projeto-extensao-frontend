import TextSnippetIcon from "@mui/icons-material/TextSnippet";
import styles from "../../styles/documento.module.css";
import { useNavigate } from "react-router-dom";

export function Documento(props) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (props.pagina === undefined) {
      alert(props.mensagemAlert);
    } else {
      navigate(props.pagina);
    }
  };

  return (
    <div className={styles.documento} onClick={handleClick}>
      <TextSnippetIcon className={styles.customIcon}></TextSnippetIcon>
      <p>{props.nome}</p>
    </div>
  );
}
export default Documento;
