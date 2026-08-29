import styles from "../../styles/card.module.css";
import { useNavigate } from "react-router-dom";
import ImagemPublic from "../ImagemPublic/ImagemPublic";

export function Card(props) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (props.pagina === undefined) {
      if (props.onClick) {
        props.onClick();
      }
    } else {
      navigate(props.pagina);
    }
  };

  return (
    <div className={styles.card} onClick={handleClick}>
      <ImagemPublic nomeImagem={props.imagemUrl} />
      <p>{props.titulo}</p>
    </div>
  );
}

export default Card;
