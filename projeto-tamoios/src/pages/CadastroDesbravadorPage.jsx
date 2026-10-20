import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonIcon from "@mui/icons-material/Person";

import { DashboardLayout } from "../layout/DashboardLayout.jsx";
import { ConfirmacaoModal } from "../components/ConfirmacaoModal/ConfirmacaoModal.jsx";
import { UploadDocumentoModal } from "../components/UploadDocumentoModal/UploadDocumentoModal.jsx";
import { FotoEnquadrada } from "../components/FotoEnquadrada/FotoEnquadrada.jsx";
import { CartaoDocumento } from "../components/CartaoDocumento/CartaoDocumento.jsx";
import { SecaoSaude } from "../components/SecaoSaude/SecaoSaude.jsx";
import { MedicacaoModal } from "../components/MedicacaoModal/MedicacaoModal.jsx";
import { ENQUADRAMENTO_PADRAO } from "../utils/enquadramento.js";

import { useCatalogos } from "../hooks/useCatalogos.js";
import { useRolarParaErro } from "../hooks/useRolarParaErro.js";
import { criarPessoa } from "../services/membrosService.js";
import { enviarDocumento, salvarEnquadramento } from "../services/documentosService.js";
import { salvarMedicacao } from "../services/medicacoesService.js";
import {
  CAMPO_NOME,
  DOCUMENTOS,
  DOCUMENTO_FICHA_MEDICA,
  DOCUMENTO_FOTO,
  calcularSpans,
  criarSecoesFormulario,
  removerResponsavel,
  renderCampo,
  renderResponsaveis,
  validarCampos,
  validarResponsaveis,
} from "../utils/desbravadorForm.jsx";

import styles from "../styles/desbravadorDetalhePage.module.css";
import formStyles from "../styles/cadastroDesbravadorModal.module.css";
import { Esqueleto } from "../components/Esqueleto/Esqueleto.jsx";

export function CadastroDesbravadorPage() {
  const navegar = useNavigate();
  const catalogos = useCatalogos();

  const [formData, setFormData] = useState({});
  const [quantidadeResponsaveis, setQuantidadeResponsaveis] = useState(1);
  const [arquivos, setArquivos] = useState({});
  const [enquadramento, setEnquadramento] = useState(ENQUADRAMENTO_PADRAO);
  const [erroForm, setErroForm] = useState("");
  const [campoComErro, setCampoComErro] = useState(null);
  const [tentativaErro, setTentativaErro] = useState(0);
  const [salvando, setSalvando] = useState(false);
  const [documentoSelecionado, setDocumentoSelecionado] = useState(null);
  const [confirmandoDescarte, setConfirmandoDescarte] = useState(false);
  const [medicacoes, setMedicacoes] = useState([]);
  const [medicacaoAberta, setMedicacaoAberta] = useState(null);

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

  const foto = arquivos[DOCUMENTO_FOTO.id]?.arquivo;
  const fotoUrl = useMemo(() => (foto ? URL.createObjectURL(foto) : null), [foto]);

  useEffect(() => {
    return () => {
      if (fotoUrl) URL.revokeObjectURL(fotoUrl);
    };
  }, [fotoUrl]);

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

  const aoSalvarDocumento = (arquivo) => {
    setArquivos((atual) => ({
      ...atual,
      [documentoSelecionado.id]: { arquivo, nome: arquivo.name },
    }));
    if (documentoSelecionado.id === DOCUMENTO_FOTO.id) {
      setEnquadramento(ENQUADRAMENTO_PADRAO);
    }
    setDocumentoSelecionado(null);
  };

  const abrirArquivoLocal = (arquivo) => {
    const url = URL.createObjectURL(arquivo);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  const aoAbrirDocumento = (documento) => abrirArquivoLocal(arquivos[documento.id].arquivo);

  const aoSalvarMedicacao = (medicacao, arquivoReceita) => {
    const preparada = { ...medicacao, arquivoReceita };
    const { indice } = medicacaoAberta;
    setMedicacoes((atual) =>
      indice == null
        ? [...atual, preparada]
        : atual.map((item, i) => (i === indice ? preparada : item))
    );
    setMedicacaoAberta(null);
  };

  const aoRemoverDocumento = (documento) => {
    setArquivos((atual) => {
      const copia = { ...atual };
      delete copia[documento.id];
      return copia;
    });
  };

  const temAlgoPreenchido =
    Object.values(formData).some((valor) => String(valor ?? "").trim() !== "") ||
    Object.keys(arquivos).length > 0 ||
    medicacoes.length > 0;

  const voltarParaLista = () => navegar("/dashboard/desbravadores");

  const aoCancelar = () => {
    if (temAlgoPreenchido) {
      setConfirmandoDescarte(true);
      return;
    }
    voltarParaLista();
  };

  const aoCadastrar = async () => {
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
    let novoMembro;
    try {
      novoMembro = await criarPessoa({ ...formData, nome: formData.nome.trim() });
    } catch (erroRequisicao) {
      const dados = erroRequisicao.response?.data;
      setErroForm(
        dados?.erro ??
          (dados && Object.values(dados)[0]) ??
          "Não foi possível cadastrar o desbravador. Tente novamente."
      );
      setCampoComErro(null);
      setSalvando(false);
      return;
    }

    await Promise.allSettled(
      Object.entries(arquivos).map(async ([tipo, { arquivo }]) => {
        const salvo = await enviarDocumento(novoMembro.id, tipo, arquivo);
        if (tipo === DOCUMENTO_FOTO.id && enquadramento !== ENQUADRAMENTO_PADRAO) {
          await salvarEnquadramento(salvo.idDocumento, enquadramento);
        }
      })
    );

    for (const medicacao of medicacoes) {
      await salvarMedicacao(novoMembro.id, medicacao, medicacao.arquivoReceita).catch(() => {});
    }

    navegar(`/dashboard/desbravadores/${novoMembro.id}`, { replace: true });
  };

  const enviados = DOCUMENTOS.filter((documento) => arquivos[documento.id]).length;
  const percentual = Math.round((enviados / DOCUMENTOS.length) * 100);

  return (
    <DashboardLayout>
      <header className={`${styles.cabecalho} ${styles.cabecalhoFixo}`}>
        <button
          type="button"
          className={styles.botaoVoltar}
          onClick={aoCancelar}
          aria-label="Voltar para a lista de desbravadores"
        >
          <ArrowBackIcon fontSize="small" />
        </button>

        <div className={styles.cabecalhoTextos}>
          <p className={styles.sobretitulo}>Novo desbravador</p>
          <h1 className={styles.titulo}>Cadastrar Desbravador</h1>
          <p className={styles.subtitulo}>
            Preencha os campos e cadastre. Os documentos anexados são enviados junto.
          </p>
        </div>

        <div className={styles.cabecalhoAcoes}>
          <button
            type="button"
            className={styles.botaoSecundario}
            onClick={aoCancelar}
            disabled={salvando}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={styles.botaoPrimario}
            onClick={aoCadastrar}
            disabled={salvando || catalogos.carregandoCatalogos}
          >
            {salvando ? "Cadastrando..." : "Cadastrar desbravador"}
          </button>
        </div>
      </header>

      <div className={styles.painel}>
        <div className={styles.coluna}>
          {erroForm && !campoComErro && (
            <p className={styles.erroBanner} role="alert">
              {erroForm}
            </p>
          )}

          <section className={styles.perfil}>
            <div className={styles.avatarArea}>
              {fotoUrl ? (
                <FotoEnquadrada
                  url={fotoUrl}
                  alt="Pré-visualização da foto"
                  enquadramento={enquadramento}
                  onChange={setEnquadramento}
                  tamanho={120}
                />
              ) : (
                <div className={styles.avatar}>
                  <PersonIcon className={styles.avatarIcone} />
                </div>
              )}

              <button
                type="button"
                className={styles.botaoFoto}
                onClick={() => setDocumentoSelecionado(DOCUMENTO_FOTO)}
              >
                {fotoUrl ? "Trocar foto" : "Adicionar foto"}
              </button>
            </div>

            <div className={styles.perfilTextos}>
              <div className={formStyles.grid}>
                {calcularSpans([CAMPO_NOME]).map((campo) =>
                  renderCampo(campo, formData, aoMudarCampo, erroForm, campoComErro, formStyles)
                )}
              </div>
            </div>
          </section>

          {catalogos.carregandoCatalogos ? (
            <Esqueleto linhas={6} altura={56} rotulo="Carregando formulário" />
          ) : (
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
          )}

          <SecaoSaude
            fichaMedica={arquivos[DOCUMENTO_FICHA_MEDICA.id] ?? null}
            onAbrirFicha={() => aoAbrirDocumento(DOCUMENTO_FICHA_MEDICA)}
            onEnviarFicha={() => setDocumentoSelecionado(DOCUMENTO_FICHA_MEDICA)}
            onRemoverFicha={() => aoRemoverDocumento(DOCUMENTO_FICHA_MEDICA)}
            medicacoes={medicacoes}
            onAdicionarMedicacao={() => setMedicacaoAberta({ indice: null, medicacao: {} })}
            onEditarMedicacao={(medicacao, indice) => setMedicacaoAberta({ indice, medicacao })}
            onRemoverMedicacao={(medicacao) =>
              setMedicacoes((atual) => atual.filter((item) => item !== medicacao))
            }
            onAbrirReceita={(medicacao) => abrirArquivoLocal(medicacao.arquivoReceita)}
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
                  arquivo={arquivos[documento.id] ?? null}
                  onAbrir={() => aoAbrirDocumento(documento)}
                  onEnviar={() => setDocumentoSelecionado(documento)}
                  onRemover={() => aoRemoverDocumento(documento)}
                />
              ))}
            </ul>
          </section>
        </aside>
      </div>

      <UploadDocumentoModal
        aberto={Boolean(documentoSelecionado)}
        documento={documentoSelecionado}
        onFechar={() => setDocumentoSelecionado(null)}
        onSalvar={aoSalvarDocumento}
      />

      {medicacaoAberta && (
        <MedicacaoModal
          medicacao={medicacaoAberta.medicacao}
          arquivoReceitaInicial={medicacaoAberta.medicacao.arquivoReceita}
          onFechar={() => setMedicacaoAberta(null)}
          onSalvar={aoSalvarMedicacao}
        />
      )}

      <ConfirmacaoModal
        aberto={confirmandoDescarte}
        titulo="Descartar cadastro?"
        mensagem="Tudo que foi preenchido neste formulário será perdido."
        textoConfirmar="Descartar"
        textoCancelar="Continuar preenchendo"
        perigo
        onConfirmar={voltarParaLista}
        onCancelar={() => setConfirmandoDescarte(false)}
      />
    </DashboardLayout>
  );
}

export default CadastroDesbravadorPage;
