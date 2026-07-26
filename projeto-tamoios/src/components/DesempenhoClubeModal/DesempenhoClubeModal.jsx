import { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import { SeletorAno } from "../SeletorAno/SeletorAno.jsx";
import {
  getDesempenho,
  salvarDesempenho,
  adicionarAno,
  calcularElegibilidadeInsignia,
} from "../../services/desempenhoService.js";
import {
  listarOcorrenciasDaPessoa,
  registrarOcorrencia,
  removerOcorrencia,
} from "../../services/ocorrenciasService.js";
import modalStyles from "../../styles/cadastroDesbravadorModal.module.css";
import styles from "../../styles/desempenhoClubeModal.module.css";

export function DesempenhoClubeModal({ aberto, membro, onFechar, onSalvar }) {
  const [desempenho, setDesempenho] = useState(null);
  const [ocorrencias, setOcorrencias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [anoSelecionado, setAnoSelecionado] = useState(null);
  const [novaOcorrenciaData, setNovaOcorrenciaData] = useState("");
  const [novaOcorrenciaDescricao, setNovaOcorrenciaDescricao] = useState("");

  useEffect(() => {
    if (!aberto || !membro) return;

    let ativo = true;
    setCarregando(true);

    Promise.all([getDesempenho(membro), listarOcorrenciasDaPessoa(membro.id)]).then(
      ([dadosDesempenho, dadosOcorrencias]) => {
        if (ativo) {
          setDesempenho(dadosDesempenho);
          setAnoSelecionado(dadosDesempenho.anoSelecionado);
          setOcorrencias(dadosOcorrencias);
          setCarregando(false);
        }
      }
    );

    return () => {
      ativo = false;
    };
  }, [aberto, membro]);

  if (!aberto || !membro) return null;

  const bucket = desempenho?.porAno[anoSelecionado];

  const aoAdicionarAno = () => {
    setDesempenho((atual) => {
      const atualizado = adicionarAno(atual, membro);
      setAnoSelecionado(atualizado.anoSelecionado);
      return atualizado;
    });
  };

  const aoAlternarEspecialidade = (especialidadeId) => {
    setDesempenho((atual) => {
      const bucketAtual = atual.porAno[anoSelecionado];
      return {
        ...atual,
        porAno: {
          ...atual.porAno,
          [anoSelecionado]: {
            ...bucketAtual,
            especialidades: bucketAtual.especialidades.map((especialidade) =>
              especialidade.id === especialidadeId
                ? { ...especialidade, concluida: !especialidade.concluida }
                : especialidade
            ),
          },
        },
      };
    });
  };

  const aoAdicionarOcorrencia = async () => {
    if (!novaOcorrenciaData || !novaOcorrenciaDescricao.trim()) return;

    const criada = await registrarOcorrencia(
      membro.id,
      novaOcorrenciaData,
      novaOcorrenciaDescricao.trim()
    );
    setOcorrencias((atual) => [...atual, criada]);
    setNovaOcorrenciaData("");
    setNovaOcorrenciaDescricao("");
  };

  const aoRemoverOcorrencia = async (ocorrenciaId) => {
    await removerOcorrencia(ocorrenciaId);
    setOcorrencias((atual) => atual.filter((o) => o.id !== ocorrenciaId));
  };

  const aoSalvar = () => {
    salvarDesempenho(membro, { ...desempenho, anoSelecionado }).then(() =>
      onSalvar?.(desempenho)
    );
  };

  const ocorrenciasDoAno = anoSelecionado
    ? ocorrencias.filter(
        (ocorrencia) => new Date(`${ocorrencia.data}T00:00:00`).getFullYear() === anoSelecionado
      )
    : [];
  const elegibilidade = desempenho
    ? calcularElegibilidadeInsignia(desempenho, anoSelecionado, ocorrenciasDoAno)
    : null;

  return (
    <div className={modalStyles.overlay} style={{ zIndex: 1350 }}>
      <div className={modalStyles.modal}>
        <header className={modalStyles.cabecalho}>
          <div>
            <h2 className={modalStyles.titulo}>Desempenho no Clube</h2>
            <p className={modalStyles.subtitulo}>
              Especialidades, ocorrências e insígnia de excelência de {membro.nome}.
            </p>
          </div>
          <button
            type="button"
            className={modalStyles.botaoFechar}
            onClick={onFechar}
            aria-label="Fechar"
          >
            <CloseIcon />
          </button>
        </header>

        <div className={modalStyles.corpo}>
          <div className={modalStyles.painelWrapper}>
            {carregando || !desempenho || !bucket ? (
              <p className={styles.mensagemCarregando}>Carregando...</p>
            ) : (
              <>
                <SeletorAno
                  anos={desempenho.anos}
                  anoSelecionado={anoSelecionado}
                  onSelecionarAno={setAnoSelecionado}
                  onAdicionarAno={aoAdicionarAno}
                />

                <section className={modalStyles.secao}>
                  <h3 className={modalStyles.secaoTitulo}>
                    Especialidades da classe {membro.classe ?? ""} em {anoSelecionado}
                  </h3>
                  {bucket.especialidades.length > 0 ? (
                    <div className={styles.listaEspecialidades}>
                      {bucket.especialidades.map((especialidade) => (
                        <label
                          key={especialidade.id}
                          className={styles.especialidadeItem}
                        >
                          <input
                            type="checkbox"
                            checked={especialidade.concluida}
                            onChange={() => aoAlternarEspecialidade(especialidade.id)}
                          />
                          {especialidade.nome}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className={styles.mensagemVazia}>
                      Sem especialidades cadastradas para a classe deste membro.
                    </p>
                  )}
                </section>

                <section className={modalStyles.secao}>
                  <h3 className={modalStyles.secaoTitulo}>
                    Ocorrências em {anoSelecionado}
                  </h3>
                  {ocorrenciasDoAno.length > 0 ? (
                    <div className={styles.listaOcorrencias}>
                      {ocorrenciasDoAno.map((ocorrencia) => (
                        <div key={ocorrencia.id} className={styles.ocorrenciaItem}>
                          <div>
                            <span className={styles.ocorrenciaData}>
                              {new Date(`${ocorrencia.data}T00:00:00`).toLocaleDateString(
                                "pt-BR"
                              )}
                            </span>
                            <p className={styles.ocorrenciaDescricao}>
                              {ocorrencia.descricao}
                            </p>
                          </div>
                          <button
                            type="button"
                            className={styles.botaoRemoverOcorrencia}
                            onClick={() => aoRemoverOcorrencia(ocorrencia.id)}
                          >
                            Remover
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={styles.mensagemVazia}>
                      Nenhuma ocorrência registrada em {anoSelecionado}.
                    </p>
                  )}

                  <div className={styles.novaOcorrencia}>
                    <input
                      type="date"
                      className={styles.inputData}
                      value={novaOcorrenciaData}
                      onChange={(e) => setNovaOcorrenciaData(e.target.value)}
                    />
                    <input
                      type="text"
                      className={styles.inputDescricao}
                      placeholder="Descrição da ocorrência"
                      value={novaOcorrenciaDescricao}
                      onChange={(e) => setNovaOcorrenciaDescricao(e.target.value)}
                    />
                    <button
                      type="button"
                      className={styles.botaoAdicionarOcorrencia}
                      onClick={aoAdicionarOcorrencia}
                    >
                      Registrar
                    </button>
                  </div>
                </section>

                <section className={modalStyles.secao}>
                  <h3 className={modalStyles.secaoTitulo}>
                    Insígnia de excelência — {anoSelecionado}
                  </h3>
                  <div
                    className={`${styles.insigniaBadge} ${
                      elegibilidade.apto ? styles.insigniaApto : styles.insigniaNaoApto
                    }`}
                  >
                    <MilitaryTechIcon />
                    {elegibilidade.apto ? "Apto a receber" : "Ainda não apto"}
                  </div>
                  <ul className={styles.listaCriterios}>
                    {elegibilidade.criterios.map((criterio) => (
                      <li key={criterio.label} className={styles.criterioItem}>
                        {criterio.atendido ? (
                          <CheckCircleIcon
                            fontSize="small"
                            className={styles.criterioIconeOk}
                          />
                        ) : (
                          <CancelIcon
                            fontSize="small"
                            className={styles.criterioIconePendente}
                          />
                        )}
                        {criterio.label}
                      </li>
                    ))}
                  </ul>
                </section>
              </>
            )}
          </div>
        </div>

        <footer className={modalStyles.rodape}>
          <button type="button" className={modalStyles.botaoCancelar} onClick={onFechar}>
            Fechar
          </button>
          <button
            type="button"
            className={modalStyles.botaoCadastrar}
            onClick={aoSalvar}
            disabled={carregando}
          >
            Salvar
          </button>
        </footer>
      </div>
    </div>
  );
}

export default DesempenhoClubeModal;
