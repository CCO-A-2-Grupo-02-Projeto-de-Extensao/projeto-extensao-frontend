import { useCallback, useEffect, useRef, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { Button } from "../Button/Button.jsx";
import { Select } from "../Select/Select.jsx";
import { Input } from "../Input/Input.jsx";
import { SelecaoModal } from "../SelecaoModal/SelecaoModal.jsx";
import { SeletorAno } from "../SeletorAno/SeletorAno.jsx";
import { CartaoDocumento } from "../CartaoDocumento/CartaoDocumento.jsx";
import { UploadDocumentoModal } from "../UploadDocumentoModal/UploadDocumentoModal.jsx";
import { ConfirmacaoModal } from "../ConfirmacaoModal/ConfirmacaoModal.jsx";
import { abrirDocumento } from "../../services/documentosService.js";
import {
  DOCUMENTOS_HISTORICO,
  ITENS_DECLARACAO,
  SERIES,
  historicoVazio,
  listarHistoricos,
  removerHistorico,
  salvarHistorico,
  trocarArquivo,
} from "../../services/historicoEscolarService.js";
import {
  calcularElegibilidadeInsignia,
  classeNoAno,
  concluirEspecialidade,
  desfazerEspecialidade,
  listarEspecialidadesConcluidas,
  primeiroAnoDeClasse,
} from "../../services/desempenhoService.js";
import {
  getClasses,
  getEspecialidades,
  getEspecialidadesDaClasse,
} from "../../services/classesService.js";
import { listarOcorrenciasDaPessoa } from "../../services/ocorrenciasService.js";
import modalStyles from "../../styles/uploadDocumentoModal.module.css";
import styles from "../../styles/desempenhoClubeModal.module.css";

const ANO_ATUAL = new Date().getFullYear();

function Marcacoes({ titulo, rotulo, itens, onAlternar, onAlternarTudo }) {
  const tudoMarcado = itens.every((item) => item.marcado);

  return (
    <div className={styles.marcacoes}>
      <div className={styles.marcacoesCabecalho}>
        {titulo}
        <Button
          variante="destaque"
          compacto
          className={styles.botaoTudo}
          texto={tudoMarcado ? "Desmarcar tudo" : "Marcar tudo"}
          onClick={() => onAlternarTudo(!tudoMarcado)}
        />
      </div>
      <div className={styles.itens} role="group" aria-label={rotulo}>
        {itens.map((item) => (
          <Button
            key={item.id}
            variante={item.marcado ? "primario" : "secundario"}
            compacto
            className={styles.item}
            aria-pressed={item.marcado}
            icone={item.marcado && <CheckCircleIcon fontSize="small" />}
            texto={item.rotulo}
            onClick={() => onAlternar(item.id)}
          />
        ))}
      </div>
    </div>
  );
}

export function DesempenhoClubeModal({ membro, onFechar }) {
  const [historicos, setHistoricos] = useState({});
  const [ocorrencias, setOcorrencias] = useState([]);
  const [classes, setClasses] = useState([]);
  const [especialidadesPorClasse, setEspecialidadesPorClasse] = useState({});
  const [catalogo, setCatalogo] = useState([]);
  const [concluidas, setConcluidas] = useState([]);
  const [escolhendoExtra, setEscolhendoExtra] = useState(false);
  const [anoSelecionado, setAnoSelecionado] = useState(ANO_ATUAL);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [campoEmUpload, setCampoEmUpload] = useState(null);
  const [confirmacao, setConfirmacao] = useState(null);
  const rascunhos = useRef({});
  const concluidasRef = useRef([]);
  const fila = useRef(Promise.resolve());

  const carregarHistoricos = useCallback(async () => {
    const lista = await listarHistoricos(membro.id);
    rascunhos.current = Object.fromEntries(lista.map((item) => [item.ano, item]));
    setHistoricos({ ...rascunhos.current });
    return lista;
  }, [membro.id]);

  const carregarConcluidas = useCallback(async () => {
    concluidasRef.current = await listarEspecialidadesConcluidas(membro.id);
    setConcluidas(concluidasRef.current);
  }, [membro.id]);

  useEffect(() => {
    let ativo = true;
    Promise.all([
      carregarHistoricos(),
      carregarConcluidas(),
      listarOcorrenciasDaPessoa(membro.id),
      getClasses(),
      getEspecialidades(),
    ])
      .then(([, , dadosOcorrencias, dadosClasses, dadosCatalogo]) => {
        if (!ativo) return;
        setOcorrencias(dadosOcorrencias);
        setClasses(dadosClasses);
        setCatalogo(dadosCatalogo);
      })
      .catch(() => {
        if (ativo) setErro("Não foi possível carregar o desempenho.");
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [membro.id, carregarHistoricos, carregarConcluidas]);

  const anos = [...new Set([ANO_ATUAL, ...Object.keys(historicos).map(Number)])]
    .sort((a, b) => b - a)
    .map((ano) => ({
      ano,
      classe: membro.dataNascimento ? classeNoAno(membro.dataNascimento, ano) : membro.classe,
    }));
  const classe = anos.find((item) => item.ano === anoSelecionado)?.classe ?? null;
  const idClasse = classes.find((item) => item.nome === classe)?.id;
  const especialidadesDaClasse = idClasse ? especialidadesPorClasse[idClasse] : [];

  useEffect(() => {
    if (!idClasse || especialidadesPorClasse[idClasse]) return;
    let ativo = true;
    getEspecialidadesDaClasse(idClasse)
      .then((lista) => {
        if (ativo) setEspecialidadesPorClasse((atual) => ({ ...atual, [idClasse]: lista }));
      })
      .catch(() => {
        if (ativo) setErro("Não foi possível carregar as especialidades da classe.");
      });
    return () => {
      ativo = false;
    };
  }, [idClasse, especialidadesPorClasse]);

  const historico = historicos[anoSelecionado] ?? historicoVazio(anoSelecionado);
  const concluidaPorEspecialidade = new Map(concluidas.map((item) => [item.idEspecialidade, item]));
  const especialidades = (especialidadesDaClasse ?? []).map((especialidade) => ({
    ...especialidade,
    concluida: concluidaPorEspecialidade.has(especialidade.id),
  }));
  const extras = concluidas.filter(
    (item) =>
      item.ano === anoSelecionado &&
      (historico.outroClube ||
        !especialidades.some((especialidade) => especialidade.id === item.idEspecialidade))
  ).sort((a, b) => a.nome.localeCompare(b.nome));
  const insignia =
    historico &&
    calcularElegibilidadeInsignia({
      ano: historico.ano,
      especialidades,
      ocorrenciasDoAno: ocorrencias.filter((ocorrencia) =>
        ocorrencia.data.startsWith(String(historico.ano))
      ),
      historico,
    });

  const executarNaFila = (tarefa, mensagemErro) => {
    setErro("");
    fila.current = fila.current.then(tarefa).catch(async () => {
      setErro(mensagemErro);
      await Promise.all([carregarHistoricos(), carregarConcluidas()]).catch(() => {});
    });
  };

  const atualizarConcluidas = (lista) => {
    concluidasRef.current = lista;
    setConcluidas(lista);
  };

  const concluir = (idEspecialidade, nome) => {
    const item = { id: null, idEspecialidade, nome, ano: anoSelecionado };
    atualizarConcluidas([...concluidasRef.current, item]);
    executarNaFila(async () => {
      item.id = (await concluirEspecialidade(membro.id, idEspecialidade, item.ano)).id;
    }, "Não foi possível salvar a especialidade.");
  };

  const desfazer = (item) => {
    atualizarConcluidas(concluidasRef.current.filter((atual) => atual !== item));
    executarNaFila(() => desfazerEspecialidade(item.id), "Não foi possível desfazer a especialidade.");
  };

  const aoAlternarEspecialidade = (idEspecialidade) => {
    const item = concluidasRef.current.find((atual) => atual.idEspecialidade === idEspecialidade);
    if (item) desfazer(item);
    else concluir(idEspecialidade, especialidades.find((e) => e.id === idEspecialidade).nome);
  };

  const aoAlternarTodasEspecialidades = (marcar) =>
    especialidades
      .filter((especialidade) => especialidade.concluida !== marcar)
      .forEach((especialidade) => aoAlternarEspecialidade(especialidade.id));

  const aoAdicionarExtras = (ids) =>
    ids.forEach((id) => concluir(id, catalogo.find((item) => item.id === id).nome));

  const enfileirar = (ano, operacao, mensagemErro) =>
    executarNaFila(async () => {
      const salvo = await operacao(rascunhos.current[ano] ?? historicoVazio(ano));
      if (!rascunhos.current[ano]) return;
      rascunhos.current[ano] = {
        ...rascunhos.current[ano],
        id: salvo.id,
        boletim: salvo.boletim,
        declaracao: salvo.declaracao,
      };
      setHistoricos({ ...rascunhos.current });
    }, mensagemErro);

  const salvar = (ano) =>
    enfileirar(ano, (atual) => salvarHistorico(membro.id, atual), "Não foi possível salvar a alteração.");

  const editar = (mudancas) => {
    const ano = anoSelecionado;
    rascunhos.current[ano] = { ...(rascunhos.current[ano] ?? historicoVazio(ano)), ...mudancas };
    setHistoricos({ ...rascunhos.current });
  };

  const alterar = (mudancas) => {
    editar(mudancas);
    salvar(anoSelecionado);
  };

  const aoEnviarArquivo = (arquivo) => {
    const campo = campoEmUpload;
    setCampoEmUpload(null);
    enfileirar(
      anoSelecionado,
      (atual) => trocarArquivo(membro.id, atual, campo, arquivo),
      "Não foi possível enviar o arquivo."
    );
  };

  const pedirRemocaoArquivo = (campo) => {
    const ano = anoSelecionado;
    setConfirmacao({
      titulo: "Remover arquivo",
      textoConfirmar: "Remover",
      mensagem: `O ${DOCUMENTOS_HISTORICO[campo].titulo.toLowerCase()} de ${ano} será excluído.`,
      acao: () =>
        enfileirar(
          ano,
          (atual) => trocarArquivo(membro.id, atual, campo, null),
          "Não foi possível remover o arquivo."
        ),
    });
  };

  const aoAdicionarAno = (ano) => {
    setAnoSelecionado(ano);
    if (rascunhos.current[ano]) return;
    rascunhos.current[ano] = historicoVazio(ano);
    setHistoricos({ ...rascunhos.current });
    enfileirar(ano, (atual) => salvarHistorico(membro.id, atual), `Não foi possível adicionar o ano ${ano}.`);
  };

  const pedirRemocaoAno = () => {
    const ano = anoSelecionado;
    setConfirmacao({
      titulo: "Excluir ano",
      textoConfirmar: "Excluir",
      mensagem: `O ano de ${ano} será excluído, junto com as especialidades, o histórico escolar e os arquivos anexados.`,
      acao: () => {
        const especialidadesDoAno = concluidasRef.current.filter((item) => item.ano === ano);
        atualizarConcluidas(concluidasRef.current.filter((item) => item.ano !== ano));
        delete rascunhos.current[ano];
        setHistoricos({ ...rascunhos.current });
        setAnoSelecionado(ANO_ATUAL);
        executarNaFila(async () => {
          await Promise.all(especialidadesDoAno.map((item) => desfazerEspecialidade(item.id)));
          const salvo = (await listarHistoricos(membro.id)).find((item) => item.ano === ano);
          if (salvo) await removerHistorico(salvo);
        }, `Não foi possível excluir o ano ${ano}.`);
      },
    });
  };

  const cartaoArquivo = (campo) => (
    <CartaoDocumento
      key={campo}
      documento={DOCUMENTOS_HISTORICO[campo]}
      arquivo={historico[campo]}
      onAbrir={() => abrirDocumento(historico[campo].idDocumento)}
      onEnviar={() => setCampoEmUpload(campo)}
      onRemover={() => pedirRemocaoArquivo(campo)}
    />
  );

  const confirmar = () => {
    confirmacao.acao();
    setConfirmacao(null);
  };

  return (
    <div className={modalStyles.overlay} style={{ zIndex: 1350 }}>
      <div
        className={`${modalStyles.modal} ${styles.modal}`}
        role="dialog"
        aria-labelledby="historico-titulo"
      >
        <header className={modalStyles.cabecalho}>
          <div>
            <h2 id="historico-titulo" className={modalStyles.titulo}>
              Desempenho no Clube
            </h2>
            <p className={`${modalStyles.subtitulo} ${styles.subtitulo}`}>
              Especialidades, histórico escolar e insígnia de {membro.nome}, por ano.
            </p>
          </div>
          <Button variante="fechar" className={styles.botaoFechar} onClick={onFechar} aria-label="Fechar">
            <CloseIcon />
          </Button>
        </header>

        <div className={modalStyles.corpo}>
          {erro && (
            <p className={styles.erro} role="alert">
              {erro}
            </p>
          )}

          {carregando ? (
            <p className={styles.mensagem}>Carregando...</p>
          ) : (
            <>
              <SeletorAno
                anos={anos}
                anoSelecionado={anoSelecionado}
                onSelecionarAno={setAnoSelecionado}
                onAdicionarAno={aoAdicionarAno}
                anoMinimo={primeiroAnoDeClasse(membro.dataNascimento) ?? ANO_ATUAL - 10}
                anoMaximo={ANO_ATUAL}
              />

              <div className={styles.painel}>
                <div className={styles.painelCabecalho}>
                  <div>
                    <h3 className={styles.painelTitulo}>
                      {historico.ano}
                      {classe && <span className={styles.painelClasse}>Classe {classe}</span>}
                    </h3>
                    <span
                      className={`${styles.status} ${
                        insignia.apto ? styles.statusOk : styles.statusPendente
                      }`}
                    >
                      <MilitaryTechIcon fontSize="inherit" />
                      {insignia.apto ? "Apto à insígnia de excelência" : "Ainda não apto à insígnia"}
                    </span>
                  </div>
                  {historico.ano !== ANO_ATUAL && (
                    <Button
                      variante="perigo"
                      compacto
                      className={styles.botaoExcluir}
                      icone={<DeleteOutlineIcon fontSize="small" />}
                      texto="Excluir ano"
                      onClick={pedirRemocaoAno}
                    />
                  )}
                </div>

                <section className={styles.grupo}>
                  <div className={styles.marcacoesCabecalho}>
                    <div>
                      <h4 className={styles.grupoTitulo}>Outro clube</h4>
                      <p className={styles.ajuda}>
                        Para quem cursou este ano em outro clube antes de vir para o Tamoios.
                      </p>
                    </div>
                    <Button
                      variante={historico.outroClube ? "perigo" : "destaque"}
                      compacto
                      className={styles.botaoTudo}
                      aria-pressed={historico.outroClube}
                      icone={historico.outroClube && <CheckCircleIcon fontSize="small" />}
                      texto="Cursado em outro clube"
                      onClick={() => alterar({ outroClube: !historico.outroClube })}
                    />
                  </div>

                  {historico.outroClube && (
                    <div className={styles.outroClube}>
                      <div className={styles.bloco}>
                        <label className={styles.blocoTitulo} htmlFor="historico-clube">
                          Nome do clube
                        </label>
                        <Input
                          id="historico-clube"
                          maxLength={100}
                          placeholder="Ex.: Clube Águias do Vale"
                          value={historico.clubeOrigem}
                          onChange={(e) => editar({ clubeOrigem: e.target.value })}
                          onBlur={() => salvar(anoSelecionado)}
                        />
                      </div>
                      <div className={styles.bloco}>
                        <span className={styles.blocoTitulo}>Classe</span>
                        <Button
                          variante={historico.classeConcluidaOrigem ? "primario" : "secundario"}
                          compacto
                          className={styles.alternarClasse}
                          aria-pressed={historico.classeConcluidaOrigem}
                          icone={
                            historico.classeConcluidaOrigem && <CheckCircleIcon fontSize="small" />
                          }
                          texto="Concluiu a classe lá"
                          onClick={() =>
                            alterar({ classeConcluidaOrigem: !historico.classeConcluidaOrigem })
                          }
                        />
                      </div>
                    </div>
                  )}
                </section>

                <section className={styles.grupo}>
                  {!historico.outroClube &&
                    (!classe || !especialidadesDaClasse || especialidades.length === 0 ? (
                      <>
                        <h4 className={styles.grupoTitulo}>Especialidades</h4>
                        <p className={styles.mensagem}>
                          {!classe
                            ? "Neste ano a idade não corresponde a nenhuma classe."
                            : !especialidadesDaClasse
                              ? "Carregando especialidades..."
                              : `A classe ${classe} ainda não tem especialidades cadastradas.`}
                        </p>
                      </>
                    ) : (
                      <Marcacoes
                        titulo={<h4 className={styles.grupoTitulo}>Especialidades</h4>}
                        rotulo="Especialidades"
                        itens={especialidades.map((especialidade) => ({
                          id: especialidade.id,
                          rotulo: especialidade.nome,
                          marcado: especialidade.concluida,
                        }))}
                        onAlternar={aoAlternarEspecialidade}
                        onAlternarTudo={aoAlternarTodasEspecialidades}
                      />
                    ))}

                  <div className={historico.outroClube ? styles.marcacoes : styles.extras}>
                    <div className={styles.marcacoesCabecalho}>
                      {historico.outroClube ? (
                        <div>
                          <h4 className={styles.grupoTitulo}>Especialidades</h4>
                          <p className={styles.ajuda}>Concluídas no outro clube neste ano.</p>
                        </div>
                      ) : (
                        <div>
                          <span className={styles.blocoTitulo}>Fora da classe</span>
                          <p className={styles.ajuda}>
                            Outras especialidades concluídas neste ano, além das da classe.
                          </p>
                        </div>
                      )}
                      <Button
                        variante="destaque"
                        compacto
                        className={styles.botaoTudo}
                        icone={<AddIcon fontSize="small" />}
                        texto="Outra especialidade"
                        onClick={() => setEscolhendoExtra(true)}
                      />
                    </div>
                    {extras.length > 0 && (
                      <ul className={styles.listaExtras}>
                        {extras.map((item) => (
                          <li key={item.idEspecialidade} className={styles.extra}>
                            <CheckCircleIcon fontSize="small" />
                            <span>{item.nome}</span>
                            <button
                              type="button"
                              className={styles.removerExtra}
                              onClick={() => desfazer(item)}
                              title="Remover"
                              aria-label={`Remover ${item.nome}`}
                            >
                              <CloseIcon fontSize="small" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </section>

                <section className={styles.grupo}>
                  <h4 className={styles.grupoTitulo}>Histórico escolar</h4>
                  <div className={styles.bloco}>
                    <label className={styles.blocoTitulo} htmlFor="historico-serie">
                      Série
                    </label>
                    <Select
                      id="historico-serie"
                      value={historico.serie}
                      onChange={(e) => alterar({ serie: e.target.value })}
                    >
                      <option value="">Selecione...</option>
                      {SERIES.map((serie) => (
                        <option key={serie} value={serie}>
                          {serie}
                        </option>
                      ))}
                      {historico.serie && !SERIES.includes(historico.serie) && (
                        <option value={historico.serie}>{historico.serie}</option>
                      )}
                    </Select>
                  </div>

                  <div className={styles.bloco}>
                    <Marcacoes
                      titulo={
                        <div>
                          <span className={styles.blocoTitulo}>Declaração dos pais</span>
                          <p className={styles.ajuda}>
                            Itens declarados pelos responsáveis, conforme o Regulamento Interno do clube.
                          </p>
                        </div>
                      }
                      rotulo="Itens da declaração"
                      itens={ITENS_DECLARACAO.map((item) => ({
                        id: item.id,
                        rotulo: item.rotulo,
                        marcado: historico[item.id],
                      }))}
                      onAlternar={(id) => alterar({ [id]: !historico[id] })}
                      onAlternarTudo={(marcado) =>
                        alterar(Object.fromEntries(ITENS_DECLARACAO.map((item) => [item.id, marcado])))
                      }
                    />
                  </div>

                  <div className={styles.bloco}>
                    <span className={styles.blocoTitulo}>Arquivos</span>
                    <ul className={styles.arquivos}>
                      {cartaoArquivo("boletim")}
                      {cartaoArquivo("declaracao")}
                    </ul>
                  </div>
                </section>

                <section className={styles.grupo}>
                  <h4 className={styles.grupoTitulo}>Insígnia de excelência</h4>
                  <ul className={styles.criterios}>
                    {insignia.criterios.map((criterio) => (
                      <li key={criterio.label} className={styles.criterio}>
                        {criterio.atendido ? (
                          <CheckCircleIcon fontSize="small" className={styles.criterioOk} />
                        ) : (
                          <CancelIcon fontSize="small" className={styles.criterioPendente} />
                        )}
                        {criterio.label}
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            </>
          )}
        </div>
      </div>

      <UploadDocumentoModal
        aberto={Boolean(campoEmUpload)}
        documento={campoEmUpload && DOCUMENTOS_HISTORICO[campoEmUpload]}
        onFechar={() => setCampoEmUpload(null)}
        onSalvar={aoEnviarArquivo}
      />

      {escolhendoExtra && (
        <SelecaoModal
          titulo="Adicionar especialidades"
          tituloSelecionados={`Concluídas em ${anoSelecionado}`}
          rotuloConfirmar="Adicionar"
          itens={catalogo
            .filter((item) => !concluidaPorEspecialidade.has(item.id))
            .map((item) => ({ id: item.id, nome: item.nome, detalhe: item.categoria }))}
          onFechar={() => setEscolhendoExtra(false)}
          onConfirmar={(ids) => {
            aoAdicionarExtras(ids);
            setEscolhendoExtra(false);
          }}
        />
      )}

      <ConfirmacaoModal
        aberto={Boolean(confirmacao)}
        titulo={confirmacao?.titulo}
        mensagem={confirmacao?.mensagem}
        textoConfirmar={confirmacao?.textoConfirmar}
        perigo
        onConfirmar={confirmar}
        onCancelar={() => setConfirmacao(null)}
      />
    </div>
  );
}

export default DesempenhoClubeModal;
