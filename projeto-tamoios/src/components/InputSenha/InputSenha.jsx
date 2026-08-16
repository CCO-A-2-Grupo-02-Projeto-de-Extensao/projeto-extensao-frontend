import { useState } from "react";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { Input } from "../Input/Input.jsx";
import styles from "../../styles/inputSenha.module.css";

export function InputSenha({ disabled, ...props }) {
  const [visivel, setVisivel] = useState(false);
  const rotulo = visivel ? "Ocultar senha" : "Mostrar senha";

  return (
    <div className={styles.campo}>
      <Input {...props} type={visivel ? "text" : "password"} disabled={disabled} />
      <button
        type="button"
        className={styles.olho}
        onClick={() => setVisivel(!visivel)}
        disabled={disabled}
        aria-label={rotulo}
        title={rotulo}
      >
        {visivel ? (
          <VisibilityOff fontSize="small" />
        ) : (
          <Visibility fontSize="small" />
        )}
      </button>
    </div>
  );
}
