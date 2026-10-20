import { normalizar } from "../services/buscaGlobalService.js";

// Dados do login guardados no localStorage (ver pages/Login.jsx).
export function lerUsuarioLogado() {
  try {
    return JSON.parse(localStorage.getItem("usuario")) ?? {};
  } catch {
    return {};
  }
}

/**
 * Diz se um membro da listagem é a própria pessoa logada.
 *
 * O caminho certo é o `idPessoa`, que o login passou a devolver. Quem entrou
 * antes dessa mudança tem no localStorage um objeto sem esse campo, e aí só
 * resta comparar o nome — menos preciso, mas erra para o lado seguro: um
 * homônimo fica protegido junto, em vez de a pessoa conseguir se desativar.
 */
export function ehMesmaPessoa(membro, logado) {
  if (!membro || !logado) return false;

  if (logado.idPessoa != null && membro.id != null) {
    return membro.id === logado.idPessoa;
  }

  const meuNome = normalizar(logado.nomePessoa);
  return Boolean(meuNome) && normalizar(membro.nome) === meuNome;
}
