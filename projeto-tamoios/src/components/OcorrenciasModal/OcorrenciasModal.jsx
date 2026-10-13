import { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { Button } from "../Button/Button.jsx";
import { ConfirmacaoModal } from "../ConfirmacaoModal/ConfirmacaoModal.jsx";
import {
  listarOcorrenciasDaPessoa,
  registrarOcorrencia,
  removerOcorrencia,
} from "../../services/ocorrenciasService.js";
import modalStyles from "../../styles/cadastroDesbravadorModal.module.css";
import styles from "../../styles/ocorrenciasModal.module.css";

const maisRecentesPrimeiro = (a, b) => b.data.localeCompare(a.data);
const formatarData = (valor) => new Date(`${valor}T00:00:00`).toLocaleDateString("pt-BR");

export function OcorrenciasModal({ membro, onFechar }) {
  const [ocorrencias, setOcorrencias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [data, setData] = useState("");
  const [descricao, setDescricao] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [ocorrenciaARemover, setOcorrenciaARemover] = useState(null);

  useEffect(() => {
    let ativo = true;

    listarOcorrenciasDaPessoa(membro.id)
      .then((dados) => {
        if (ativo) setOcorrencias(dados);
      })
      .catch(() => {
        if (ativo) setErro("Não foi possível carregar as ocorrências.");
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [membro]);

  const aoRegistrar = async () => {
    setSalvando(true);
    setErro("");
    try {
      const criada = await registrarOcorrencia(membro.id, data, descricao.trim());
      setOcorrencias((atual) => [...atual, criada]);
      setData("");
      setDescricao("");
    } catch {
      setErro("Não foi possível registrar a ocorrência.");
    } finally {
      setSalvando(false);
    }
  };

  const confirmarRemocao = async () => {
    const { id } = ocorrenciaARemover;
    setOcorrenciaARemover(null);
    setErro("");
    try {
      await removerOcorrencia(id);
      setOcorrencias((atual) => atual.filter((ocorrencia) => ocorrencia.id !== id));
    } catch {
      setErro("Não foi possível remover a ocorrência.");
    }
  };

  return (
    <div className={modalStyles.overlay} style={{ zIndex: 1350 }}>
      <div className={modalStyles.modal}>
        <header className={modalStyles.cabecalho}>
          <div>
            <h2 className={modalStyles.titulo}>Ocorrências</h2>
            <p className={modalStyles.subtitulo}>Registros de comportamento de {membro.nome}.</p>
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
            {erro && (
              <p className={styles.erro} role="alert">
                {erro}
              </p>
            )}

            <section className={modalStyles.secao}>
              <h3 className={modalStyles.secaoTitulo}>Registrar ocorrência</h3>
              <div className={styles.nova}>
                <input
                  type="date"
                  className={styles.inputData}
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  aria-label="Data da ocorrência"
                />
                <input
                  type="text"
                  className={styles.inputDescricao}
                  placeholder="Descrição da ocorrência"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                />
                <Button
                  onClick={aoRegistrar}
                  disabled={salvando || !data || !descricao.trim()}
                  texto={salvando ? "Registrando..." : "Registrar"}
                />
              </div>
            </section>

            <section className={modalStyles.secao}>
              <h3 className={modalStyles.secaoTitulo}>
                Histórico{ocorrencias.length > 0 ? ` (${ocorrencias.length})` : ""}
              </h3>
              {carregando ? (
                <p className={styles.mensagemVazia}>Carregando...</p>
              ) : ocorrencias.length === 0 ? (
                <p className={styles.mensagemVazia}>Nenhuma ocorrência registrada.</p>
              ) : (
                <ul className={styles.lista}>
                  {[...ocorrencias].sort(maisRecentesPrimeiro).map((ocorrencia) => (
                    <li key={ocorrencia.id} className={styles.item}>
                      <div>
                        <span className={styles.data}>{formatarData(ocorrencia.data)}</span>
                        <p className={styles.descricao}>{ocorrencia.descricao}</p>
                      </div>
                      <Button
                        variante="perigo"
                        compacto
                        onClick={() => setOcorrenciaARemover(ocorrencia)}
                        texto="Remover"
                      />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      </div>

      <ConfirmacaoModal
        aberto={Boolean(ocorrenciaARemover)}
        titulo="Remover ocorrência"
        mensagem={
          ocorrenciaARemover &&
          `A ocorrência de ${formatarData(ocorrenciaARemover.data)} ("${ocorrenciaARemover.descricao}") será excluída.`
        }
        textoConfirmar="Remover"
        perigo
        onConfirmar={confirmarRemocao}
        onCancelar={() => setOcorrenciaARemover(null)}
      />
    </div>
  );
}

export default OcorrenciasModal;
