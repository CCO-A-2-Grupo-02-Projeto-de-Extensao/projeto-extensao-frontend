import { SituacaoDesbravadorModal } from "../SituacaoDesbravadorModal/SituacaoDesbravadorModal.jsx";

// Par do RemoverDesbravadorModal: mesma tela, lista de inativos e botao verde.
export function ReativarDesbravadorModal(props) {
  return <SituacaoDesbravadorModal variante="reativar" {...props} />;
}

export default ReativarDesbravadorModal;
