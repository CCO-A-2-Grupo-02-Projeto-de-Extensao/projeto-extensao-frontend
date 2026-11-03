import { useState } from "react";
import PasswordIcon from "@mui/icons-material/Password";
import { Input } from "../Input/Input.jsx";
import styles from "../../styles/esqueceuSenhaModal.module.css";

const EMAIL_SECRETARIA = "secretaria@clubetamoios.com";

export function EsqueceuSenhaModal({ aberto, onFechar }) {
  const [email, setEmail] = useState("");

  const emailValido = /\S+@\S+\.\S+/.test(email.trim());

  const aoFechar = () => {
    setEmail("");
    onFechar();
  };

  const aoEnviar = () => {
    const assunto = encodeURIComponent("Recuperação de senha - Arandu Digital");
    const corpo = encodeURIComponent(
      `Olá, esqueci a senha de acesso do e-mail ${email.trim()}. Podem me ajudar a redefinir?`
    );
    window.location.href = `mailto:${EMAIL_SECRETARIA}?subject=${assunto}&body=${corpo}`;
    aoFechar();
  };

  if (!aberto) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <header className={styles.cabecalho}>
          <div>
            <h2 className={styles.titulo}>Esqueceu a Senha?</h2>
          </div>
        </header>
        <div>
          <div className={styles.corpo}>
            <div className={styles.corpo__icone}>
              <PasswordIcon className={styles.customIcon} />
            </div>
            <div className={styles.corpo__formulario}>
              <p>
                Caso tenha esquecido a senha, insira o seu email de cadastro
                existente:
              </p>
              <Input
                type="email"
                placeholder="Seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div className={styles.corpo__contato}>
            <span>Ou entre em contato com a secretaria do Clube Tamoios:</span>
            <span>{EMAIL_SECRETARIA}</span>
            <span>(11)94682-9633</span>
          </div>
        </div>

        <footer className={styles.rodape}>
          <button
            type="button"
            className={styles.botaoCancelar}
            onClick={aoFechar}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={styles.botaoCadastrar}
            onClick={aoEnviar}
            disabled={!emailValido}
          >
            Enviar
          </button>
        </footer>
      </div>
    </div>
  );
}

export default EsqueceuSenhaModal;
