import { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { DocumentCard } from "../DocumentCard/DocumentCard.jsx";
import { UploadDocumentoModal } from "../UploadDocumentoModal/UploadDocumentoModal.jsx";
import { SeletorAno } from "../SeletorAno/SeletorAno.jsx";
import {
  getDesempenho,
  salvarDesempenho,
  adicionarAno,
} from "../../services/desempenhoService.js";
import modalStyles from "../../styles/cadastroDesbravadorModal.module.css";
import styles from "../../styles/historicoEscolarModal.module.css";

const DOCUMENTOS_ESCOLARES = {
  boletim: { id: "boletim", titulo: "Boletim Escolar" },
  declaracaoPais: { id: "declaracaoPais", titulo: "Declaração dos Pais" },
};

export function HistoricoEscolarModal({ aberto, membro, onFechar, onSalvar }) {
  const [desempenho, setDesempenho] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [anoSelecionado, setAnoSelecionado] = useState(null);
  const [documentoEmUpload, setDocumentoEmUpload] = useState(null);

  useEffect(() => {
    if (!aberto || !membro) return;

    let ativo = true;
    setCarregando(true);

    getDesempenho(membro).then((dados) => {
      if (ativo) {
        setDesempenho(dados);
        setAnoSelecionado(dados.anoSelecionado);
        setCarregando(false);
      }
    });

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

  const aoSalvarArquivo = (arquivo) => {
    const arquivoSalvo = {
      nome: arquivo.name,
      tamanho: arquivo.size,
      tipo: arquivo.type,
      url: URL.createObjectURL(arquivo),
    };

    setDesempenho((atual) => {
      const bucketAtual = atual.porAno[anoSelecionado];
      const bucketAtualizado =
        documentoEmUpload.id === "boletim"
          ? { ...bucketAtual, boletim: { ...bucketAtual.boletim, arquivo: arquivoSalvo } }
          : {
              ...bucketAtual,
              declaracaoPais: { ...bucketAtual.declaracaoPais, arquivo: arquivoSalvo },
            };

      return {
        ...atual,
        porAno: { ...atual.porAno, [anoSelecionado]: bucketAtualizado },
      };
    });
    setDocumentoEmUpload(null);
  };

  const aoRemoverArquivo = (campo) => {
    setDesempenho((atual) => {
      const bucketAtual = atual.porAno[anoSelecionado];
      return {
        ...atual,
        porAno: {
          ...atual.porAno,
          [anoSelecionado]: {
            ...bucketAtual,
            [campo]: { ...bucketAtual[campo], arquivo: null },
          },
        },
      };
    });
  };

  const aoMudarAnoLetivo = (valor) => {
    setDesempenho((atual) => {
      const bucketAtual = atual.porAno[anoSelecionado];
      return {
        ...atual,
        porAno: {
          ...atual.porAno,
          [anoSelecionado]: {
            ...bucketAtual,
            boletim: { ...bucketAtual.boletim, anoLetivoSerie: valor },
          },
        },
      };
    });
  };

  const aoMudarDeclaracao = (campo) => {
    setDesempenho((atual) => {
      const bucketAtual = atual.porAno[anoSelecionado];
      return {
        ...atual,
        porAno: {
          ...atual.porAno,
          [anoSelecionado]: {
            ...bucketAtual,
            declaracaoPais: {
              ...bucketAtual.declaracaoPais,
              [campo]: !bucketAtual.declaracaoPais[campo],
            },
          },
        },
      };
    });
  };

  const aoSalvar = () => {
    salvarDesempenho(membro, { ...desempenho, anoSelecionado }).then(() =>
      onSalvar?.(desempenho)
    );
  };

  return (
    <div className={modalStyles.overlay} style={{ zIndex: 1350 }}>
      <div className={modalStyles.modal}>
        <header className={modalStyles.cabecalho}>
          <div>
            <h2 className={modalStyles.titulo}>Histórico Escolar</h2>
            <p className={modalStyles.subtitulo}>
              Boletim e declaração dos pais de {membro.nome} — desempenho na escola,
              fora do clube.
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
                  <h3 className={modalStyles.secaoTitulo}>Boletim escolar</h3>
                  <div className={modalStyles.grid}>
                    <div className={modalStyles.campo}>
                      <label className={modalStyles.campoLabel} htmlFor="anoLetivoSerie">
                        Ano letivo / série
                      </label>
                      <input
                        id="anoLetivoSerie"
                        type="text"
                        className={styles.input}
                        placeholder="Ex: 2026 - 7º ano"
                        value={bucket.boletim.anoLetivoSerie}
                        onChange={(e) => aoMudarAnoLetivo(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className={styles.documentoArea}>
                    <DocumentCard
                      titulo={DOCUMENTOS_ESCOLARES.boletim.titulo}
                      arquivo={bucket.boletim.arquivo}
                      onEnviar={() => setDocumentoEmUpload(DOCUMENTOS_ESCOLARES.boletim)}
                      onVisualizar={() =>
                        bucket.boletim.arquivo &&
                        window.open(bucket.boletim.arquivo.url, "_blank")
                      }
                      onRemover={() => aoRemoverArquivo("boletim")}
                    />
                  </div>
                </section>

                <section className={modalStyles.secao}>
                  <h3 className={modalStyles.secaoTitulo}>Declaração dos pais</h3>
                  <p className={modalStyles.documentosSubtitulo}>
                    Itens declarados pelos pais/responsáveis, conforme o Regulamento
                    Interno do clube.
                  </p>
                  <div className={styles.checklist}>
                    <label className={styles.checklistItem}>
                      <input
                        type="checkbox"
                        checked={bucket.declaracaoPais.obediencia}
                        onChange={() => aoMudarDeclaracao("obediencia")}
                      />
                      Obediência
                    </label>
                    <label className={styles.checklistItem}>
                      <input
                        type="checkbox"
                        checked={bucket.declaracaoPais.prestatividade}
                        onChange={() => aoMudarDeclaracao("prestatividade")}
                      />
                      Prestatividade
                    </label>
                    <label className={styles.checklistItem}>
                      <input
                        type="checkbox"
                        checked={bucket.declaracaoPais.participacao}
                        onChange={() => aoMudarDeclaracao("participacao")}
                      />
                      Participação
                    </label>
                  </div>
                  <div className={styles.documentoArea}>
                    <DocumentCard
                      titulo={DOCUMENTOS_ESCOLARES.declaracaoPais.titulo}
                      arquivo={bucket.declaracaoPais.arquivo}
                      onEnviar={() =>
                        setDocumentoEmUpload(DOCUMENTOS_ESCOLARES.declaracaoPais)
                      }
                      onVisualizar={() =>
                        bucket.declaracaoPais.arquivo &&
                        window.open(bucket.declaracaoPais.arquivo.url, "_blank")
                      }
                      onRemover={() => aoRemoverArquivo("declaracaoPais")}
                    />
                  </div>
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

      <UploadDocumentoModal
        aberto={Boolean(documentoEmUpload)}
        documento={documentoEmUpload}
        onFechar={() => setDocumentoEmUpload(null)}
        onSalvar={aoSalvarArquivo}
      />
    </div>
  );
}

export default HistoricoEscolarModal;
