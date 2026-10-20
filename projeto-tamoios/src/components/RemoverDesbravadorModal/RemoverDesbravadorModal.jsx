import { SituacaoDesbravadorModal } from "../SituacaoDesbravadorModal/SituacaoDesbravadorModal.jsx";

// Desativar e reativar sao a mesma tela; o conteudo vive no componente
// compartilhado e aqui fica so o nome que a pagina de Desbravadores importa.
export function RemoverDesbravadorModal(props) {
  return <SituacaoDesbravadorModal variante="desativar" {...props} />;
}

export default RemoverDesbravadorModal;
