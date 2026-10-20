import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonIcon from "@mui/icons-material/Person";
import CallIcon from "@mui/icons-material/Call";
import ChatIcon from "@mui/icons-material/Chat";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import EditIcon from "@mui/icons-material/Edit";

import { DashboardLayout } from "../layout/DashboardLayout.jsx";
import { ConfirmacaoModal } from "../components/ConfirmacaoModal/ConfirmacaoModal.jsx";
import { DesempenhoClubeModal } from "../components/DesempenhoClubeModal/DesempenhoClubeModal.jsx";
import { OcorrenciasModal } from "../components/OcorrenciasModal/OcorrenciasModal.jsx";
import { UploadDocumentoModal } from "../components/UploadDocumentoModal/UploadDocumentoModal.jsx";
import { FotoEnquadrada } from "../components/FotoEnquadrada/FotoEnquadrada.jsx";
import { CartaoDocumento } from "../components/CartaoDocumento/CartaoDocumento.jsx";
import { SecaoSaude } from "../components/SecaoSaude/SecaoSaude.jsx";
import { MedicacaoModal } from "../components/MedicacaoModal/MedicacaoModal.jsx";
import {
  ENQUADRAMENTO_PADRAO,
  normalizarEnquadramento,
} from "../utils/enquadramento.js";

import { useCatalogos } from "../hooks/useCatalogos.js";
import { useRolarParaErro } from "../hooks/useRolarParaErro.js";
import {
  atualizarPessoa,
  getMembro,
  desativarPessoa,
  reativarPessoa,
} from "../services/membrosService.js";
import {
  enviarDocumento,
  listarDocumentosDaPessoa,
  removerDocumento,
  salvarEnquadramento,
  substituirDocumento,
  urlLocalDoDocumento,
  abrirDocumento,
} from "../services/documentosService.js";
import {
  listarMedicacoesDaPessoa,
  removerMedicacao,
  salvarMedicacao,
} from "../services/medicacoesService.js";
import {
  CAMPO_NOME,
  DOCUMENTOS,
  DOCUMENTO_FICHA_MEDICA,
  DOCUMENTO_FOTO,
  MAX_RESPONSAVEIS,
  calcularSpans,
  contarResponsaveis,
  criarSecoesFormulario,
  removerResponsavel,
  renderCampo,
  renderResponsaveis,
  validarCampos,
  validarResponsaveis,
} from "../utils/desbravadorForm.jsx";

import styles from "../styles/desbravadorDetalhePage.module.css";
// Os campos reaproveitam o visual do formulário de cadastro: as classes de
// input/label/grid não dependem do modal, só do próprio elemento.
import formStyles from "../styles/cadastroDesbravadorModal.module.css";
import { Esqueleto } from "../components/Esqueleto/Esqueleto.jsx";

function formatarData(valor) {
  if (!valor) return null;
  const data = new Date(`${valor}T00:00:00`);
  if (Number.isNaN(data.getTime())) return valor;
  return data.toLocaleDateString("pt-BR");
}

function calcularIdade(valor) {
  if (!valor) return null;
  const nascimento = new Date(`${valor}T00:00:00`);
  if (Number.isNaN(nascimento.getTime())) return null;
  const hoje = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mes = hoje.getMonth() - nascimento.getMonth();
  if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) idade -= 1;
  return idade;
}

// Mantém só os dígitos para montar os links tel: e wa.me (o telefone é
// guardado já mascarado, no formato (00) 00000-0000).
function apenasDigitos(telefone) {
  return String(telefone ?? "").replace(/\D/g, "");
}

function Dado({ rotulo, valor }) {
  return (
    <div className={styles.dado}>
      <span className={styles.dadoRotulo}>{rotulo}</span>
      {valor ? (
        <span className={styles.dadoValor}>{valor}</span>
      ) : (
        <span className={styles.dadoVazio}>Não informado</span>
      )}
    </div>
  );
}

function CartaoResponsavel({ numero, responsavel }) {
  const digitos = apenasDigitos(responsavel.telefone);

  return (
    <article className={styles.responsavel}>
      <h3 className={styles.responsavelTitulo}>Responsável {numero}</h3>
      <p className={styles.responsavelNome}>
        {responsavel.nome || <span className={styles.dadoVazio}>Sem nome</span>}
      </p>

      {responsavel.telefone && (
        <p className={styles.responsavelTelefone}>
          <CallIcon fontSize="small" />
          {responsavel.telefone}
        </p>
      )}

      <dl className={styles.responsavelLinhas}>
        <div className={styles.responsavelLinha}>
          <dt>RG</dt>
          <dd>{responsavel.rg || "—"}</dd>
        </div>
        <div className={styles.responsavelLinha}>
          <dt>CPF</dt>
          <dd>{responsavel.cpf || "—"}</dd>
        </div>
      </dl>

      {digitos && (
        <div className={styles.responsavelAcoes}>
          <a className={styles.botaoContato} href={`tel:+55${digitos}`}>
            <CallIcon fontSize="small" />
            Ligar
          </a>
          <a
            className={styles.botaoContato}
            href={`https://wa.me/55${digitos}`}
            target="_blank"
            rel="noreferrer"
          >
            <ChatIcon fontSize="small" />
            WhatsApp
          </a>
        </div>
      )}
    </article>
  );
}

function ConteudoDesbravador({ idPessoa }) {
  const navegar = useNavigate();
  const catalogos = useCatalogos();

  const [membro, setMembro] = useState(null);
  const [documentos, setDocumentos] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  // Edição acontece na própria tela: `editando` troca os blocos de leitura
  // pelos campos do formulário, sem modal.
  const [editando, setEditando] = useState(false);
  const [formData, setFormData] = useState({});
  const [quantidadeResponsaveis, setQuantidadeResponsaveis] = useState(0);
  const [erroForm, setErroForm] = useState("");
  const [campoComErro, setCampoComErro] = useState(null);
  const [tentativaErro, setTentativaErro] = useState(0);
  const [salvando, setSalvando] = useState(false);

  const [confirmacaoAberta, setConfirmacaoAberta] = useState(false);
  const [modalDesempenhoAberto, setModalDesempenhoAberto] = useState(false);
  const [modalOcorrenciasAberto, setModalOcorrenciasAberto] = useState(false);
  const [documentoSelecionado, setDocumentoSelecionado] = useState(null);
  const [documentoARemover, setDocumentoARemover] = useState(null);
  const [medicacoes, setMedicacoes] = useState([]);
  const [medicacaoAberta, setMedicacaoAberta] = useState(null);
  const [medicacaoARemover, setMedicacaoARemover] = useState(null);

  // A foto não pode sair direto no src: o endpoint é protegido. Baixamos o
  // arquivo autenticado e guardamos o object URL junto do id que o gerou,
  // para derivar a foto atual sem zerar o estado dentro do efeito.
  // `versaoFoto` força o recarregamento quando a foto é substituída
  // mantendo o mesmo id.
  const [foto, setFoto] = useState({ id: null, url: null });
  const [versaoFoto, setVersaoFoto] = useState(0);
  // Enquadramento sendo ajustado; só vai para o banco ao salvar a tela.
  const [enquadramento, setEnquadramento] = useState(ENQUADRAMENTO_PADRAO);

  useRolarParaErro(campoComErro, tentativaErro);

  const secoesFormulario = useMemo(
    () => criarSecoesFormulario(catalogos, formData),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- comparamos pelas listas em si, não pelo objeto novo a cada render
    [
      catalogos.cargos,
      catalogos.classes,
      catalogos.generos,
      catalogos.unidades,
      formData.genero,
      formData.dataNascimento,
      formData.unidade,
    ]
  );

  useEffect(() => {
    let ativo = true;

    getMembro(idPessoa)
      .then((dados) => {
        if (!ativo) return;
        setMembro(dados);
        setCarregando(false);
        return listarDocumentosDaPessoa(dados.id);
      })
      .then((docs) => {
        if (ativo && docs) setDocumentos(docs);
      })
      .catch(() => {
        if (!ativo) return;
        setErro("Não foi possível carregar os dados deste desbravador.");
        setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [idPessoa]);

  useEffect(() => {
    let ativo = true;
    listarMedicacoesDaPessoa(idPessoa)
      .then((lista) => {
        if (ativo) setMedicacoes(lista);
      })
      .catch(() => {});
    return () => {
      ativo = false;
    };
  }, [idPessoa]);

  const idFoto = documentos.foto?.idDocumento ?? null;

  useEffect(() => {
    if (!idFoto) return undefined;

    let ativo = true;
    let urlCriada = null;

    urlLocalDoDocumento(idFoto)
      .then((url) => {
        // Se o efeito já foi descartado, revoga na hora para não vazar.
        if (!ativo) {
          URL.revokeObjectURL(url);
          return;
        }
        urlCriada = url;
        setFoto({ id: idFoto, url });
      })
      .catch(() => {
        if (ativo) setFoto({ id: idFoto, url: null });
      });

    return () => {
      ativo = false;
      if (urlCriada) URL.revokeObjectURL(urlCriada);
    };
  }, [idFoto, versaoFoto]);

  // Só vale a foto baixada para o documento que está em tela; se a foto for
  // removida (idFoto vira null), isto dá null sozinho.
  const fotoUrl = foto.id === idFoto ? foto.url : null;

  const abrirEdicao = () => {
    setFormData({
      ...membro,
      cargo: membro.idCargo != null ? String(membro.idCargo) : "",
      classe: membro.idClasse != null ? String(membro.idClasse) : "",
      genero: membro.idGenero != null ? String(membro.idGenero) : "",
      unidade: membro.idUnidade != null ? String(membro.idUnidade) : "",
    });
    setQuantidadeResponsaveis(contarResponsaveis(membro));
    setEnquadramento(normalizarEnquadramento(documentos.foto));
    setErroForm("");
    setCampoComErro(null);
    setEditando(true);
  };

  const cancelarEdicao = () => {
    setEditando(false);
    setEnquadramento(normalizarEnquadramento(documentos.foto));
    setErroForm("");
    setCampoComErro(null);
  };

  const aoMudarCampo = (campo, valorDigitado) => {
    const valor = campo.mascara ? campo.mascara(valorDigitado) : valorDigitado;
    setFormData((atual) => ({ ...atual, [campo.name]: valor }));
    if (campo.name === campoComErro) {
      setErroForm("");
      setCampoComErro(null);
    }
  };

  const aoAdicionarResponsavel = () => {
    setQuantidadeResponsaveis((atual) => atual + 1);
    setErroForm("");
    setCampoComErro(null);
  };

  const aoRemoverResponsavel = (numero) => {
    setFormData((atual) => removerResponsavel(atual, numero, quantidadeResponsaveis));
    setQuantidadeResponsaveis((atual) => atual - 1);
    setErroForm("");
    setCampoComErro(null);
  };

  const aoSalvar = async () => {
    setTentativaErro((n) => n + 1);
    const todosCampos = [CAMPO_NOME, ...secoesFormulario.flatMap((s) => s.campos)];
    const resultado =
      validarCampos(todosCampos, formData) ??
      validarResponsaveis(formData, quantidadeResponsaveis);
    if (resultado) {
      setErroForm(resultado.mensagem);
      setCampoComErro(resultado.campo);
      return;
    }

    setSalvando(true);
    try {
      const fotoAtual = documentos.foto;
      const salvo = normalizarEnquadramento(fotoAtual);
      const mudouEnquadramento =
        fotoAtual &&
        (salvo.posX !== enquadramento.posX ||
          salvo.posY !== enquadramento.posY ||
          salvo.zoom !== enquadramento.zoom);

      if (mudouEnquadramento) {
        await salvarEnquadramento(fotoAtual.idDocumento, enquadramento);
        setDocumentos((atual) => ({
          ...atual,
          foto: { ...atual.foto, ...enquadramento },
        }));
      }

      const atualizado = await atualizarPessoa(membro.id, {
        ...formData,
        nome: formData.nome.trim(),
      });
      setMembro({
        ...atualizado,
        documentacao: DOCUMENTOS.every((doc) => documentos[doc.id]),
      });
      setEditando(false);
      setErroForm("");
      setCampoComErro(null);
    } catch (erroRequisicao) {
      const dados = erroRequisicao.response?.data;
      setErroForm(
        dados?.erro ??
          (dados && Object.values(dados)[0]) ??
          "Não foi possível salvar as alterações."
      );
      setCampoComErro(null);
    } finally {
      setSalvando(false);
    }
  };

  const aoAlterarStatus = async () => {
    if (membro.ativo) {
      setConfirmacaoAberta(true);
      return;
    }
    await reativarPessoa(membro.id);
    setMembro({ ...membro, ativo: true });
  };

  const aoSalvarDocumento = async (arquivo) => {
    const existente = documentos[documentoSelecionado.id];
    const salvo = existente
      ? await substituirDocumento(existente.idDocumento, arquivo)
      : await enviarDocumento(membro.id, documentoSelecionado.id, arquivo);

    setDocumentos((atual) => ({ ...atual, [documentoSelecionado.id]: salvo }));
    if (documentoSelecionado.id === DOCUMENTO_FOTO.id) {
      setVersaoFoto((n) => n + 1);
      // Outra imagem: os deslocamentos antigos não querem dizer nada nela.
      setEnquadramento(ENQUADRAMENTO_PADRAO);
    }
    setDocumentoSelecionado(null);
  };

  // Mesmo motivo da foto: abrir a URL da API direto cai em 401, porque a
  // aba nova não leva o token.
  const aoAbrirDocumento = (documento) => {
    const existente = documentos[documento.id];
    if (existente) abrirDocumento(existente.idDocumento);
  };

  const aoSalvarMedicacao = async (medicacao, arquivoReceita) => {
    const salva = await salvarMedicacao(
      membro.id,
      medicacao,
      arquivoReceita,
      medicacaoAberta.receita
    );
    setMedicacoes((atual) =>
      medicacao.id
        ? atual.map((item) => (item.id === salva.id ? salva : item))
        : [...atual, salva]
    );
    setMedicacaoAberta(null);
  };

  const confirmarRemocaoMedicacao = async () => {
    await removerMedicacao(medicacaoARemover);
    setMedicacoes((atual) => atual.filter((item) => item.id !== medicacaoARemover.id));
    setMedicacaoARemover(null);
  };

  const confirmarRemocaoDocumento = async () => {
    const existente = documentos[documentoARemover.id];
    if (existente) {
      await removerDocumento(existente.idDocumento);
      setDocumentos((atual) => {
        const copia = { ...atual };
        delete copia[documentoARemover.id];
        return copia;
      });
    }
    setDocumentoARemover(null);
  };

  const confirmarDesativacao = async () => {
    await desativarPessoa(membro.id);
    setConfirmacaoAberta(false);
    setMembro({ ...membro, ativo: false });
  };

  if (carregando) {
    return (
      <DashboardLayout>
        <Esqueleto linhas={6} altura={96} rotulo="Carregando desbravador" />
      </DashboardLayout>
    );
  }

  if (erro || !membro) {
    return (
      <DashboardLayout>
        <p className={styles.mensagemErro}>{erro || "Desbravador não encontrado."}</p>
        <button type="button" className={styles.botaoVoltar} onClick={() => navegar(-1)}>
          <ArrowBackIcon fontSize="small" />
          Voltar
        </button>
      </DashboardLayout>
    );
  }

  const idade = calcularIdade(membro.dataNascimento);
  const telefoneDigitos = apenasDigitos(membro.telefone);

  const responsaveis = Array.from({ length: MAX_RESPONSAVEIS }, (_, indice) => ({
    nome: membro[`nomeResponsavel${indice + 1}`],
    telefone: membro[`telefoneResponsavel${indice + 1}`],
    rg: membro[`rgResponsavel${indice + 1}`],
    cpf: membro[`cpfResponsavel${indice + 1}`],
  })).filter(({ nome, telefone, rg, cpf }) => nome || telefone || rg || cpf);

  const enviados = DOCUMENTOS.filter((documento) => documentos[documento.id]).length;
  const percentual = Math.round((enviados / DOCUMENTOS.length) * 100);

  return (
    <DashboardLayout>
      <header
        className={`${styles.cabecalho} ${editando ? styles.cabecalhoFixo : ""}`}
      >
        <button
          type="button"
          className={styles.botaoVoltar}
          onClick={() => navegar("/dashboard/desbravadores")}
          aria-label="Voltar para a lista de desbravadores"
        >
          <ArrowBackIcon fontSize="small" />
        </button>

        <div className={styles.cabecalhoTextos}>
          <p className={styles.sobretitulo}>
            {membro.unidade || "Sem unidade"}
            {membro.classe ? ` • ${membro.classe}` : ""}
            <span className={styles.matricula}>Matrícula #{membro.id}</span>
          </p>
          <h1 className={styles.titulo}>
            {editando ? "Editar Informações" : "Informações do Desbravador"}
          </h1>
          <p className={styles.subtitulo}>
            {editando
              ? "Altere os campos e salve. Os documentos continuam ao lado, salvos na hora do envio."
              : "Dados cadastrais, responsáveis e acervo de documentação."}
          </p>
        </div>

        <div className={styles.cabecalhoAcoes}>
          {editando ? (
            <>
              <button
                type="button"
                className={styles.botaoSecundario}
                onClick={cancelarEdicao}
                disabled={salvando}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={styles.botaoPrimario}
                onClick={aoSalvar}
                disabled={salvando}
              >
                {salvando ? "Salvando..." : "Salvar alterações"}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className={membro.ativo ? styles.botaoDesativar : styles.botaoReativar}
                onClick={aoAlterarStatus}
              >
                {membro.ativo ? "Desativar" : "Reativar"}
              </button>
              <button
                type="button"
                className={styles.botaoPrimario}
                onClick={abrirEdicao}
              >
                <EditIcon fontSize="small" />
                Editar Informações
              </button>
            </>
          )}
        </div>
      </header>

      <div className={styles.painel}>
        <div className={styles.coluna}>
          {/* Erros de submissão não pertencem a nenhum campo, então aparecem
              acima do formulário; os de validação ficam no próprio campo. */}
          {editando && erroForm && !campoComErro && (
            <p className={styles.erroBanner} role="alert">
              {erroForm}
            </p>
          )}

          <section className={styles.perfil}>
            <div className={styles.avatarArea}>
              {fotoUrl ? (
                <FotoEnquadrada
                  url={fotoUrl}
                  alt={`Foto de ${membro.nome}`}
                  // Em edição o ajuste é ao vivo; em leitura vale o que está salvo.
                  enquadramento={editando ? enquadramento : documentos.foto}
                  onChange={editando ? setEnquadramento : undefined}
                  tamanho={editando ? 120 : 92}
                />
              ) : (
                <div className={styles.avatar}>
                  <PersonIcon className={styles.avatarIcone} />
                </div>
              )}

              {editando && (
                <button
                  type="button"
                  className={styles.botaoFoto}
                  onClick={() => setDocumentoSelecionado(DOCUMENTO_FOTO)}
                >
                  {fotoUrl ? "Trocar foto" : "Adicionar foto"}
                </button>
              )}
            </div>

            <div className={styles.perfilTextos}>
              {editando ? (
                <>
                  <div className={formStyles.grid}>
                    {calcularSpans([CAMPO_NOME]).map((campo) =>
                      renderCampo(campo, formData, aoMudarCampo, erroForm, campoComErro, formStyles)
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.perfilBadges}>
                    <span className={styles.tagPapel}>{membro.papel || "Sem cargo"}</span>
                    <span
                      className={`${styles.tagStatus} ${
                        membro.ativo ? styles.tagStatusAtivo : styles.tagStatusInativo
                      }`}
                    >
                      {membro.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                  <h2 className={styles.perfilNome}>{membro.nome}</h2>
                  <div className={styles.perfilLinha}>
                    <Dado
                      rotulo="Nascimento"
                      valor={
                        membro.dataNascimento
                          ? `${formatarData(membro.dataNascimento)}${
                              idade !== null ? ` (${idade} anos)` : ""
                            }`
                          : null
                      }
                    />
                    <Dado rotulo="Gênero" valor={membro.genero} />
                  </div>
                </>
              )}
            </div>
          </section>

          {editando ? (
            <>
              {secoesFormulario.map((secao) => (
                <section key={secao.titulo} className={styles.secao}>
                  <h2 className={styles.secaoTitulo}>{secao.titulo}</h2>
                  <div className={formStyles.grid}>
                    {calcularSpans(secao.campos).map((campo) =>
                      renderCampo(campo, formData, aoMudarCampo, erroForm, campoComErro, formStyles)
                    )}
                  </div>
                </section>
              ))}

              <section className={styles.secao}>
                <h2 className={styles.secaoTitulo}>Responsáveis</h2>
                {renderResponsaveis({
                  formData,
                  quantidade: quantidadeResponsaveis,
                  onAdicionar: aoAdicionarResponsavel,
                  onRemover: aoRemoverResponsavel,
                  aoMudarCampo,
                  erro: erroForm,
                  campoComErro,
                  styles: formStyles,
                })}
              </section>
            </>
          ) : (
            <>
              <section className={styles.blocoDados}>
                <Dado rotulo="Cargo" valor={membro.papel} />
                <Dado rotulo="Unidade" valor={membro.unidade} />
                <Dado rotulo="Classe" valor={membro.classe} />
                <Dado
                  rotulo="Telefone"
                  valor={
                    membro.telefone && telefoneDigitos ? (
                      <a className={styles.link} href={`tel:+55${telefoneDigitos}`}>
                        {membro.telefone}
                      </a>
                    ) : (
                      membro.telefone
                    )
                  }
                />
                <Dado rotulo="CPF" valor={membro.cpf} />
                <Dado rotulo="RG" valor={membro.rg} />
                <Dado rotulo="Escola" valor={membro.escola} />
                <Dado rotulo="Turma" valor={membro.turma} />
              </section>

              <section className={styles.secao}>
                <div className={styles.secaoCabecalho}>
                  <h2 className={styles.secaoTitulo}>Responsáveis</h2>
                  <span className={styles.secaoContagem}>
                    {responsaveis.length === 1
                      ? "1 contato cadastrado"
                      : `${responsaveis.length} contatos cadastrados`}
                  </span>
                </div>

                {responsaveis.length === 0 ? (
                  <p className={styles.mensagemVazia}>Nenhum responsável cadastrado.</p>
                ) : (
                  <div className={styles.responsaveis}>
                    {responsaveis.map((responsavel, indice) => (
                      <CartaoResponsavel
                        key={indice}
                        numero={indice + 1}
                        responsavel={responsavel}
                      />
                    ))}
                  </div>
                )}
              </section>
            </>
          )}

          <SecaoSaude
            fichaMedica={documentos[DOCUMENTO_FICHA_MEDICA.id] ?? null}
            onAbrirFicha={() => aoAbrirDocumento(DOCUMENTO_FICHA_MEDICA)}
            onEnviarFicha={() => setDocumentoSelecionado(DOCUMENTO_FICHA_MEDICA)}
            onRemoverFicha={() => setDocumentoARemover(DOCUMENTO_FICHA_MEDICA)}
            medicacoes={medicacoes}
            onAdicionarMedicacao={() => setMedicacaoAberta({})}
            onEditarMedicacao={setMedicacaoAberta}
            onRemoverMedicacao={setMedicacaoARemover}
            onAbrirReceita={(medicacao) => abrirDocumento(medicacao.receita.idDocumento)}
          />
        </div>

        <aside className={styles.colunaLateral}>
          <section className={styles.documentos}>
            <div className={styles.documentosCabecalho}>
              <div>
                <h2 className={styles.secaoTitulo}>Dados digitalizados</h2>
                <p className={styles.percentual}>{percentual}%</p>
              </div>
              <span className={styles.documentosContagem}>
                {enviados} de {DOCUMENTOS.length} anexados
              </span>
            </div>

            <div
              className={styles.barra}
              role="progressbar"
              aria-valuenow={percentual}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Documentação digitalizada"
            >
              <div className={styles.barraPreenchida} style={{ width: `${percentual}%` }} />
            </div>

            <ul className={styles.documentosGrade}>
              {DOCUMENTOS.map((documento) => (
                <CartaoDocumento
                  key={documento.id}
                  documento={documento}
                  arquivo={documentos[documento.id] ?? null}
                  onAbrir={() => aoAbrirDocumento(documento)}
                  onEnviar={() => setDocumentoSelecionado(documento)}
                  onRemover={() => setDocumentoARemover(documento)}
                />
              ))}
            </ul>
          </section>

          <div className={styles.atalhos}>
            <button
              type="button"
              className={styles.atalho}
              onClick={() => setModalDesempenhoAberto(true)}
            >
              <MilitaryTechIcon className={styles.atalhoIcone} />
              <span className={styles.atalhoTexto}>
                <strong>Desempenho no Clube</strong>
                <small>Especialidades, histórico escolar e insígnia</small>
              </span>
              <ChevronRightIcon className={styles.atalhoSeta} />
            </button>

            <button
              type="button"
              className={styles.atalho}
              onClick={() => setModalOcorrenciasAberto(true)}
            >
              <ReportProblemIcon className={styles.atalhoIcone} />
              <span className={styles.atalhoTexto}>
                <strong>Ocorrências</strong>
                <small>Registros de comportamento</small>
              </span>
              <ChevronRightIcon className={styles.atalhoSeta} />
            </button>
          </div>
        </aside>
      </div>


      {modalDesempenhoAberto && (
        <DesempenhoClubeModal membro={membro} onFechar={() => setModalDesempenhoAberto(false)} />
      )}

      {modalOcorrenciasAberto && (
        <OcorrenciasModal membro={membro} onFechar={() => setModalOcorrenciasAberto(false)} />
      )}

      <UploadDocumentoModal
        aberto={Boolean(documentoSelecionado)}
        documento={documentoSelecionado}
        onFechar={() => setDocumentoSelecionado(null)}
        onSalvar={aoSalvarDocumento}
      />

      <ConfirmacaoModal
        aberto={Boolean(documentoARemover)}
        titulo="Remover documento"
        mensagem={`O arquivo de "${documentoARemover?.titulo}" será excluído e não dá para desfazer.`}
        textoConfirmar="Remover"
        perigo
        onConfirmar={confirmarRemocaoDocumento}
        onCancelar={() => setDocumentoARemover(null)}
      />

      {medicacaoAberta && (
        <MedicacaoModal
          medicacao={medicacaoAberta}
          onFechar={() => setMedicacaoAberta(null)}
          onSalvar={aoSalvarMedicacao}
        />
      )}

      <ConfirmacaoModal
        aberto={Boolean(medicacaoARemover)}
        titulo="Remover medicação"
        mensagem={`"${medicacaoARemover?.nome}" sai da ficha médica, junto com a receita anexada.`}
        textoConfirmar="Remover"
        perigo
        onConfirmar={confirmarRemocaoMedicacao}
        onCancelar={() => setMedicacaoARemover(null)}
      />

      <ConfirmacaoModal
        aberto={confirmacaoAberta}
        titulo="Desativar desbravador"
        mensagem={`${membro.nome} deixará de aparecer nas listagens e chamadas do clube. É possível reativar depois.`}
        textoConfirmar="Desativar"
        perigo
        onConfirmar={confirmarDesativacao}
        onCancelar={() => setConfirmacaoAberta(false)}
      />
    </DashboardLayout>
  );
}

// A key força a remontagem ao navegar de um desbravador para outro, o que
// devolve o estado inicial (carregando) sem precisar resetá-lo no efeito.
export function DesbravadorDetalhePage() {
  const { idPessoa } = useParams();
  return <ConteudoDesbravador key={idPessoa} idPessoa={idPessoa} />;
}

export default DesbravadorDetalhePage;
