import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LockIcon from "@mui/icons-material/Lock";
import DeleteIcon from "@mui/icons-material/Delete";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlined";
import { Input } from "../components/Input/Input.jsx";
import { Select } from "../components/Select/Select.jsx";
import { Pagination } from "../components/Pagination/Pagination.jsx";
import { Esqueleto } from "../components/Esqueleto/Esqueleto.jsx";
import { CadastroUsuarioModal } from "../components/CadastroUsuarioModal/CadastroUsuarioModal.jsx";
import { ConfirmacaoModal } from "../components/ConfirmacaoModal/ConfirmacaoModal.jsx";
import { useCatalogos } from "../hooks/useCatalogos.js";
import {
  excluirUsuario,
  getMembros,
  listarUsuarios,
  SITUACOES,
} from "../services/membrosService.js";
import { normalizar } from "../services/buscaGlobalService.js";
import { Avatar } from "../components/Avatar/Avatar.jsx";
import detalhe from "../styles/desbravadorDetalhePage.module.css";
import tabela from "../styles/tabelaBase.module.css";
import filtros from "../styles/memberFilters.module.css";
import situacao from "../styles/memberTable.module.css";
import styles from "../styles/cadastroUsuarioPage.module.css";

const CARGOS_COM_ACESSO = ["Diretor", "Secretário", "Tesoureiro", "Instrutor"];
const CARGOS_QUE_CADASTRAM = ["Diretor", "Secretário"];
// O topo da hierarquia nao pode perder o acesso: sem Diretor ninguem consegue
// recriar usuarios, entao a exclusao fica bloqueada para todo mundo.
const CARGO_MAIS_ALTO = "Diretor";
const TODOS = "todos";
const TAMANHO_PAGINA = 10;

function lerUsuarioLogado() {
  try {
    return JSON.parse(localStorage.getItem("usuario")) ?? {};
  } catch {
    return {};
  }
}

export function CadastroUsuarioPage() {
  const navegar = useNavigate();
  const { cargos } = useCatalogos();
  const logado = useMemo(() => lerUsuarioLogado(), []);
  const podeCadastrar = CARGOS_QUE_CADASTRAM.includes(logado.nomeCargo);

  const [pessoas, setPessoas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [aExcluir, setAExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroAcao, setErroAcao] = useState("");

  const [ordenacao, setOrdenacao] = useState("az");
  const [cargo, setCargo] = useState(TODOS);
  const [filtroSituacao, setFiltroSituacao] = useState(SITUACOES.TODOS);
  const [busca, setBusca] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);

  const carregar = useCallback(
    () =>
      Promise.all([getMembros(), podeCadastrar ? listarUsuarios() : []])
        .then(([membros, lista]) => {
          setPessoas(membros.filter((membro) => membro.ativo));
          setUsuarios(lista);
          setErro("");
        })
        .catch(() => setErro("Não foi possível carregar os usuários."))
        .finally(() => setCarregando(false)),
    [podeCadastrar]
  );

  useEffect(() => {
    carregar();
  }, [carregar]);

  const cargosDeAcesso = cargos.filter((item) =>
    CARGOS_COM_ACESSO.includes(item.nome)
  );

  const pessoasSemAcesso = useMemo(() => {
    const cpfs = new Set(usuarios.map((usuario) => usuario.cpfPessoa));
    return pessoas
      .filter((membro) => !membro.cpf || !cpfs.has(membro.cpf))
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }, [pessoas, usuarios]);

  const filtrados = useMemo(() => {
    const alvo = normalizar(busca);
    return usuarios
      .filter((usuario) => {
        if (filtroSituacao === SITUACOES.ATIVOS) return usuario.ativo;
        if (filtroSituacao === SITUACOES.INATIVOS) return !usuario.ativo;
        return true;
      })
      .filter((usuario) => cargo === TODOS || usuario.nomeCargo === cargo)
      .filter(
        (usuario) =>
          !alvo ||
          normalizar(usuario.nomePessoa).includes(alvo) ||
          normalizar(usuario.email).includes(alvo)
      )
      .sort((a, b) =>
        ordenacao === "az"
          ? a.nomePessoa.localeCompare(b.nomePessoa)
          : b.nomePessoa.localeCompare(a.nomePessoa)
      );
  }, [usuarios, filtroSituacao, cargo, busca, ordenacao]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(filtrados.length / TAMANHO_PAGINA)
  );
  // Derivada, e nao sincronizada por efeito: excluir o ultimo item de uma
  // pagina encolhe a lista e deixaria paginaAtual fora do intervalo.
  const pagina = Math.min(paginaAtual, totalPaginas);
  const daPagina = filtrados.slice(
    (pagina - 1) * TAMANHO_PAGINA,
    pagina * TAMANHO_PAGINA
  );

  const mudarFiltro = (definir) => (evento) => {
    definir(evento.target.value);
    setPaginaAtual(1);
  };

  const ativos = usuarios.filter((usuario) => usuario.ativo);
  const resumo = [
    { rotulo: "Ativos", valor: ativos.length },
    { rotulo: "Inativos", valor: usuarios.length - ativos.length },
    ...CARGOS_COM_ACESSO.map((nome) => ({
      rotulo: nome,
      valor: ativos.filter((usuario) => usuario.nomeCargo === nome).length,
    })),
  ];

  // Devolve o motivo pelo qual o acesso nao pode ser excluido, ou "" se puder.
  const motivoBloqueio = (usuario) => {
    if (usuario.idUsuario === logado.idUsuario)
      return "Você não pode excluir o seu próprio acesso.";
    if (usuario.nomeCargo === CARGO_MAIS_ALTO)
      return `O acesso de ${CARGO_MAIS_ALTO} não pode ser excluído.`;
    return "";
  };

  const aoCriar = (nome) => {
    setModalAberto(false);
    setAviso(`Acesso criado para ${nome}.`);
    carregar();
  };

  const confirmarExclusao = async () => {
    setExcluindo(true);

    try {
      await excluirUsuario(aExcluir.idUsuario);
      setErroAcao("");
      setAviso(`Acesso de ${aExcluir.nomePessoa} excluído.`);
      await carregar();
    } catch {
      setAviso("");
      setErroAcao(
        `Não foi possível excluir o acesso de ${aExcluir.nomePessoa}.`
      );
    } finally {
      setExcluindo(false);
      setAExcluir(null);
    }
  };

  return (
    <>
      <header className={detalhe.cabecalho}>
        <button
          type="button"
          className={detalhe.botaoVoltar}
          onClick={() => navegar("/dashboard")}
          aria-label="Voltar para o início"
        >
          <ArrowBackIcon fontSize="small" />
        </button>

        <div className={detalhe.cabecalhoTextos}>
          <p className={detalhe.sobretitulo}>
            Acesso ao sistema
            {!carregando && podeCadastrar && (
              <span className={detalhe.matricula}>
                {usuarios.length} usuários cadastrados
              </span>
            )}
          </p>
          <h1 className={detalhe.titulo}>Usuários</h1>
          <p className={detalhe.subtitulo}>
            Quem da diretoria e da equipe de instrutores pode entrar no Arandu.
          </p>
        </div>

        <div className={detalhe.cabecalhoAcoes}>
          <button
            type="button"
            className={detalhe.botaoPrimario}
            onClick={() => {
              setAviso("");
              setModalAberto(true);
            }}
            disabled={!podeCadastrar || carregando}
          >
            <PersonAddIcon fontSize="small" />
            Cadastrar usuário
          </button>
        </div>
      </header>

      {!podeCadastrar && (
        <p className={`${styles.aviso} ${styles.avisoErro}`} role="alert">
          <LockIcon fontSize="small" />
          Só Diretor ou Secretário podem cadastrar e ver os usuários.
        </p>
      )}

      {aviso && (
        <p className={`${styles.aviso} ${styles.avisoSucesso}`} role="status">
          <CheckCircleIcon fontSize="small" />
          {aviso}
        </p>
      )}

      {erroAcao && (
        <p className={`${styles.aviso} ${styles.avisoErro}`} role="alert">
          <ErrorOutlineIcon fontSize="small" />
          {erroAcao}
        </p>
      )}

      {podeCadastrar && (
        <>
          <section className={`${detalhe.blocoDados} ${styles.resumo}`}>
            {resumo.map(({ rotulo, valor }) => (
              <div key={rotulo} className={detalhe.dado}>
                <span className={detalhe.dadoRotulo}>{rotulo}</span>
                <span className={styles.resumoValor}>
                  {carregando ? "—" : valor}
                </span>
              </div>
            ))}
          </section>

          <section className={`${detalhe.secao} ${styles.listagem}`}>
            <div className={detalhe.secaoCabecalho}>
              <h2 className={detalhe.secaoTitulo}>Usuários</h2>
              {!carregando && !erro && (
                <span className={detalhe.secaoContagem}>
                  {filtrados.length}{" "}
                  {filtrados.length === 1 ? "encontrado" : "encontrados"}
                </span>
              )}
            </div>

            <div className={filtros.filtros}>
              <div className={filtros.campoOrdenacao}>
                <Select
                  value={ordenacao}
                  onChange={mudarFiltro(setOrdenacao)}
                  aria-label="Ordenação"
                >
                  <option value="az">A-Z</option>
                  <option value="za">Z-A</option>
                </Select>
              </div>
              <div className={filtros.campoSituacao}>
                <Select
                  value={cargo}
                  onChange={mudarFiltro(setCargo)}
                  aria-label="Cargo"
                >
                  <option value={TODOS}>Todos os cargos</option>
                  {CARGOS_COM_ACESSO.map((nome) => (
                    <option key={nome} value={nome}>
                      {nome}
                    </option>
                  ))}
                </Select>
              </div>
              <div className={filtros.campoSituacao}>
                <Select
                  value={filtroSituacao}
                  onChange={mudarFiltro(setFiltroSituacao)}
                  aria-label="Situação"
                >
                  <option value={SITUACOES.TODOS}>Ativos e inativos</option>
                  <option value={SITUACOES.ATIVOS}>Ativos</option>
                  <option value={SITUACOES.INATIVOS}>Inativos</option>
                </Select>
              </div>
              <div className={filtros.campoBusca}>
                <Input
                  type="search"
                  placeholder="Buscar por nome ou e-mail"
                  value={busca}
                  onChange={mudarFiltro(setBusca)}
                  aria-label="Buscar usuário"
                />
              </div>
            </div>

            {carregando ? (
              <Esqueleto linhas={6} rotulo="Carregando usuários" />
            ) : erro ? (
              <span className={styles.vazio}>{erro}</span>
            ) : filtrados.length === 0 ? (
              <span className={styles.vazio}>Nenhum usuário encontrado.</span>
            ) : (
              <>
                <table className={`${tabela.tabela} ${styles.tabela}`}>
                  <thead>
                    <tr>
                      <th>Usuário</th>
                      <th>E-mail</th>
                      <th>Cargo</th>
                      <th>Situação</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {daPagina.map((usuario) => (
                      <tr key={usuario.idUsuario}>
                        <td>
                          <span className={styles.usuario}>
                            <Avatar
                              nome={usuario.nomePessoa}
                              tamanho={32}
                              inativo={!usuario.ativo}
                            />
                            <span className={styles.pessoaNome}>
                              {usuario.nomePessoa}
                            </span>
                          </span>
                        </td>
                        <td className={styles.email}>{usuario.email}</td>
                        <td>
                          <span className={detalhe.tagPapel}>
                            {usuario.nomeCargo}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`${situacao.tagSituacao} ${
                              usuario.ativo
                                ? situacao.tagAtivo
                                : situacao.tagDesativado
                            }`}
                          >
                            {usuario.ativo ? "Ativo" : "Inativo"}
                          </span>
                        </td>
                        <td>
                          <div className={styles.acoes}>
                            <button
                              type="button"
                              className={styles.botaoExcluir}
                              onClick={() => {
                                setAviso("");
                                setErroAcao("");
                                setAExcluir(usuario);
                              }}
                              disabled={Boolean(motivoBloqueio(usuario))}
                              title={
                                motivoBloqueio(usuario) ||
                                `Excluir acesso de ${usuario.nomePessoa}`
                              }
                              aria-label={
                                motivoBloqueio(usuario) ||
                                `Excluir acesso de ${usuario.nomePessoa}`
                              }
                            >
                              <DeleteIcon fontSize="small" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {totalPaginas > 1 && (
                  <Pagination
                    paginaAtual={pagina}
                    totalPaginas={totalPaginas}
                    onPaginaChange={setPaginaAtual}
                  />
                )}
              </>
            )}
          </section>
        </>
      )}

      {modalAberto && (
        <CadastroUsuarioModal
          pessoas={pessoasSemAcesso}
          cargos={cargosDeAcesso}
          onFechar={() => setModalAberto(false)}
          onCriado={aoCriar}
        />
      )}

      <ConfirmacaoModal
        aberto={Boolean(aExcluir)}
        titulo="Excluir acesso"
        mensagem={
          aExcluir && (
            <>
              <strong>{aExcluir.nomePessoa}</strong> perde o acesso ao Arandu e
              o login <strong>{aExcluir.email}</strong> deixa de existir. O
              cadastro da pessoa continua no sistema.
            </>
          )
        }
        textoConfirmar={excluindo ? "Excluindo..." : "Excluir"}
        perigo
        onConfirmar={confirmarExclusao}
        onCancelar={() => !excluindo && setAExcluir(null)}
      />
    </>
  );
}

export default CadastroUsuarioPage;
