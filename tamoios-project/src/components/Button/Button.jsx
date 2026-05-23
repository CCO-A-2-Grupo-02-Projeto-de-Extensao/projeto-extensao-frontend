import styles from "../../styles/button.module.css";
import { useNavigate } from "react-router-dom";

export function Button(props) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(props.pagina);
  };

  return (
    <button
      className={{ ...styles.button, ...props.style }}
      onClick={handleClick}
    >
      {props.texto}
    </button>
  );
}

export default Button;
