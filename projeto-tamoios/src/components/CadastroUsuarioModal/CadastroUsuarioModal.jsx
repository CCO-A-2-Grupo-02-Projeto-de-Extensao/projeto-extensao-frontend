import { useEffect, useMemo, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Input } from "../Input/Input.jsx";
import { InputSenha } from "../InputSenha/InputSenha.jsx";
import { Button } from "../Button/Button.jsx";
import { useFecharAoClicarFora } from "../../hooks/useFecharAoClicarFora.js";
import { criarUsuario } from "../../services/membrosService.js";
import { normalizar } from "../../services/buscaGlobalService.js";
import { Avatar } from "../Avatar/Avatar.jsx";
import formStyles from "../../styles/cadastroDesbravadorModal.module.css";
import styles from "../../styles/cadastroUsuarioPage.module.css";

const NIVEIS_SENHA = ["Muito fraca", "Fraca", "Média", "Boa", "Forte"];

function forcaDaSenha(senha) {
  if (senha.length < 6) return 0;
  const pontos = [
    true,
    senha.length >= 10,
    /\d/.test(senha),
    /[a-z]/.test(senha) && /[A-Z]/.test(senha),
    /[^A-Za-z0-9]/.test(senha),
  ].filter(Boolean).length;
  return Math.min(pontos, 4);
}

export function CadastroUsuarioModal({ pessoas, cargos, onFechar, onCriado }) {
  const fecharAoClicarFora = useFecharAoClicarFora(onFechar);
  const [termo, setTermo] = useState("");
  const [sugestoesAbertas, setSugestoesAbertas] = useState(false);
  const [pessoa, setPessoa] = useState(null);
  const [idCargo, setIdCargo] = useState(null);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [tentouEnviar, setTentouEnviar] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState("");

  useEffect(() => {
    const aoTeclar = (evento) => {
      if (evento.key === "Escape" && !salvando) onFechar();
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [onFechar, salvando]);

  const sugestoes = useMemo(() => {
    const alvo = normalizar(termo);
    return pessoas
      .filter((membro) => !alvo || normalizar(membro.nome).includes(alvo))
      .slice(0, 8);
  }, [pessoas, termo]);

  const forca = forcaDaSenha(senha);
  const erros = {
    pessoa: !pessoa && "Escolha a pessoa que vai receber o acesso.",
    cargo: !idCargo && "Escolha o cargo de acesso.",
    email:
      !/^\S+@\S+\.\S+$/.test(email) && "Informe um e-mail válido para o login.",
    senha: senha.length < 6 && "A senha precisa de pelo menos 6 caracteres.",
    confirmacao: senha !== confirmacao && "As senhas não coincidem.",
  };
  const mostrarErro = (campo) => tentouEnviar && erros[campo];

  const escolherPessoa = (membro) => {
    setPessoa(membro);
    setTermo("");
    setSugestoesAbertas(false);
    const cargoDaPessoa = cargos.find((cargo) => cargo.nome === membro.papel);
    if (cargoDaPessoa) setIdCargo(cargoDaPessoa.id);
  };

  const aoEnviar = async (evento) => {
    evento.preventDefault();
    setTentouEnviar(true);
    setErroEnvio("");
    if (Object.values(erros).some(Boolean)) return;

    setSalvando(true);
    try {
      await criarUsuario({ idPessoa: pessoa.id, idCargo, email, senha });
      onCriado(pessoa.nome);
    } catch (erro) {
      setErroEnvio(
        erro.response?.data?.message ||
          "Não foi possível cadastrar o usuário. Tente novamente."
      );
      setSalvando(false);
    }
  };

  return (
    <div className={styles.overlay} {...fecharAoClicarFora}>
      <form
        className={styles.modal}
        onSubmit={aoEnviar}
        noValidate
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-novo-usuario"
      >
        <div className={styles.modalCabecalho}>
          <div>
            <h2 id="titulo-novo-usuario" className={styles.modalTitulo}>
              Novo usuário
            </h2>
            <span className={styles.modalSubtitulo}>
              Dê acesso ao Arandu para alguém da diretoria ou dos instrutores.
            </span>
          </div>
          <Button
            variante="fechar"
            onClick={onFechar}
            disabled={salvando}
            aria-label="Fechar"
          >
            ×
          </Button>
        </div>

        <div className={styles.modalCorpo}>
          {erroEnvio && (
            <p className={`${styles.aviso} ${styles.avisoErro}`} role="alert">
              {erroEnvio}
            </p>
          )}

          <section className={styles.etapa}>
            <span className={styles.etapaNumero}>1</span>
            <div className={styles.etapaCorpo}>
              <h3 className={styles.etapaTitulo}>Quem vai acessar</h3>
              <span className={styles.etapaDica}>
                Só aparecem membros ativos que ainda não têm login.
              </span>

              {pessoa ? (
                <div className={styles.pessoaEscolhida}>
                  <Avatar nome={pessoa.nome} />
                  <div className={styles.pessoaTextos}>
                    <span className={styles.pessoaNome}>{pessoa.nome}</span>
                    <span className={styles.pessoaDetalhe}>
                      {[pessoa.papel, pessoa.unidade]
                        .filter(Boolean)
                        .join(" • ")}
                    </span>
                  </div>
                  <Button
                    variante="secundario"
                    compacto
                    onClick={() => setPessoa(null)}
                  >
                    Trocar
                  </Button>
                </div>
              ) : (
                <div
                  className={styles.busca}
                  onBlur={(evento) => {
                    if (!evento.currentTarget.contains(evento.relatedTarget)) {
                      setSugestoesAbertas(false);
                    }
                  }}
                >
                  <SearchIcon className={styles.buscaIcone} fontSize="small" />
                  <Input
                    type="search"
                    placeholder="Buscar membro pelo nome"
                    value={termo}
                    onChange={(evento) => {
                      setTermo(evento.target.value);
                      setSugestoesAbertas(true);
                    }}
                    onFocus={() => setSugestoesAbertas(true)}
                    aria-label="Buscar membro"
                    autoFocus
                  />
                  {sugestoesAbertas && (
                    <div className={styles.sugestoes}>
                      {sugestoes.length === 0 ? (
                        <span className={styles.vazio}>
                          Nenhum membro disponível com esse nome.
                        </span>
                      ) : (
                        sugestoes.map((membro) => (
                          <button
                            key={membro.id}
                            type="button"
                            className={styles.sugestao}
                            onClick={() => escolherPessoa(membro)}
                          >
                            <Avatar nome={membro.nome} tamanho={32} />
                            <span className={styles.pessoaTextos}>
                              <span className={styles.pessoaNome}>
                                {membro.nome}
                              </span>
                              <span className={styles.pessoaDetalhe}>
                                {[membro.papel, membro.unidade]
                                  .filter(Boolean)
                                  .join(" • ")}
                              </span>
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
              {mostrarErro("pessoa") && (
                <span className={formStyles.campoErro}>{erros.pessoa}</span>
              )}
            </div>
          </section>

          <section className={styles.etapa}>
            <span className={styles.etapaNumero}>2</span>
            <div className={styles.etapaCorpo}>
              <h3 className={styles.etapaTitulo}>Cargo de acesso</h3>
              <span className={styles.etapaDica}>
                Diretor e Secretário também podem cadastrar novos usuários.
              </span>
              <div className={styles.cargos} role="radiogroup">
                {cargos.map((cargo) => (
                  <button
                    key={cargo.id}
                    type="button"
                    role="radio"
                    aria-checked={idCargo === cargo.id}
                    className={`${styles.cargo} ${
                      idCargo === cargo.id ? styles.cargoAtivo : ""
                    }`}
                    onClick={() => setIdCargo(cargo.id)}
                  >
                    {idCargo === cargo.id && (
                      <CheckCircleIcon fontSize="small" />
                    )}
                    {cargo.nome}
                  </button>
                ))}
              </div>
              {mostrarErro("cargo") && (
                <span className={formStyles.campoErro}>{erros.cargo}</span>
              )}
            </div>
          </section>

          <section className={styles.etapa}>
            <span className={styles.etapaNumero}>3</span>
            <div className={styles.etapaCorpo}>
              <h3 className={styles.etapaTitulo}>Credenciais</h3>
              <span className={styles.etapaDica}>
                O e-mail é o login. A senha pode ser trocada depois.
              </span>

              <div className={formStyles.grid}>
                <label className={formStyles.campoSpan2}>
                  <span className={formStyles.campoLabel}>E-mail</span>
                  <Input
                    type="email"
                    placeholder="nome@clube.com"
                    value={email}
                    onChange={(evento) => setEmail(evento.target.value)}
                    autoComplete="off"
                  />
                  {mostrarErro("email") && (
                    <span className={formStyles.campoErro}>{erros.email}</span>
                  )}
                </label>

                <label className={formStyles.campo}>
                  <span className={formStyles.campoLabel}>Senha</span>
                  <InputSenha
                    placeholder="Mínimo de 6 caracteres"
                    value={senha}
                    onChange={(evento) => setSenha(evento.target.value)}
                    autoComplete="new-password"
                  />
                  {mostrarErro("senha") && (
                    <span className={formStyles.campoErro}>{erros.senha}</span>
                  )}
                </label>

                <label className={formStyles.campo}>
                  <span className={formStyles.campoLabel}>Confirmar senha</span>
                  <InputSenha
                    placeholder="Repita a senha"
                    value={confirmacao}
                    onChange={(evento) => setConfirmacao(evento.target.value)}
                    autoComplete="new-password"
                  />
                  {confirmacao && erros.confirmacao && (
                    <span className={formStyles.campoErro}>
                      {erros.confirmacao}
                    </span>
                  )}
                </label>
              </div>

              {senha && (
                <div className={styles.forca} data-nivel={forca}>
                  <div className={styles.forcaBarras}>
                    {[1, 2, 3, 4].map((nivel) => (
                      <span
                        key={nivel}
                        className={
                          forca >= nivel ? styles.forcaBarraCheia : undefined
                        }
                      />
                    ))}
                  </div>
                  <span className={styles.forcaRotulo}>
                    Senha {NIVEIS_SENHA[forca].toLowerCase()}
                  </span>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className={styles.modalRodape}>
          <Button variante="secundario" onClick={onFechar} disabled={salvando}>
            Cancelar
          </Button>
          <Button type="submit" disabled={salvando}>
            {salvando ? "Cadastrando..." : "Cadastrar usuário"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CadastroUsuarioModal;
