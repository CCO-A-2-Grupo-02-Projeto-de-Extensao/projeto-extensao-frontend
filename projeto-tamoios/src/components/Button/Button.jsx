import { useNavigate } from "react-router-dom";

import styles from "../../styles/button.module.css";

/**
 * Botão padrão do app. A cor sai da `variante`, não de estilo solto na tela —
 * ver styles/button.module.css para a lista.
 *
 * `pagina` e `mensagemAlert` existem porque as telas de Login e Cadastro de
 * Usuário nasceram usando o botão como atalho de navegação. Quando `onClick` é
 * passado, ele manda; os outros dois são o comportamento antigo.
 */
export function Button({
  texto,
  children,
  variante = "primario",
  icone,
  larguraTotal = false,
  compacto = false,
  pagina,
  mensagemAlert,
  onClick,
  className = "",
  type = "button",
  ...resto
}) {
  const navigate = useNavigate();

  const aoClicar = (evento) => {
    if (onClick) {
      onClick(evento);
      return;
    }

    if (pagina !== undefined) {
      navigate(pagina);
      return;
    }

    if (mensagemAlert !== undefined) {
      alert(mensagemAlert);
    }
  };

  // Antes isto era `className={{ ...styles.button, ...props.style }}`: espalhar
  // uma string dentro de um objeto entregava um objeto ao React, que renderizava
  // class="[object Object]". O botão só parecia certo porque o CSS global de
  // elemento o pintava por fora.
  const classes = [
    styles.botao,
    styles[variante],
    larguraTotal ? styles.larguraTotal : "",
    compacto ? styles.compacto : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={classes} onClick={aoClicar} {...resto}>
      {icone}
      {texto ?? children}
    </button>
  );
}

export default Button;
