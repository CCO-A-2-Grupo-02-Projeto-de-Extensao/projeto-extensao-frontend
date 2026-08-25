import { Button } from "../Button/Button.jsx";

// Atalho para o botão de barra de ação: é o Button na variante secundária, com
// o ícone à esquerda. Mantido porque Desbravadores e Especialidades já o usam.
export function ActionButton({ icon, texto, onClick }) {
  return (
    <Button variante="secundario" icone={icon} texto={texto} onClick={onClick} />
  );
}

export default ActionButton;
