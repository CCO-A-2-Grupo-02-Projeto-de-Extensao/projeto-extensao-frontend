import { useEffect, useState } from "react";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import { getDesbravadoresDaUnidade } from "../../services/classesService.js";
import {
  MAXIMO_DESBRAVADORES,
  idadeEm,
} from "../../utils/regrasUnidade.js";

import styles from "../../styles/unidadeDetalheModal.module.css";

function Campo({ rotulo, valor }) {
  return (
    <div className={styles.campo}>
      <span className={styles.rotulo}>{rotulo}</span>
      <span className={valor ? styles.valor : styles.valorVazio}>
        {valor || "Não informado"}
      </span>
    </div>
  );
}

export function UnidadeDetalheModal({ unidade, onFechar }) {
  const [desbravadores, setDesbravadores] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    getDesbravadoresDaUnidade(unidade.id)
      .then(setDesbravadores)
      .catch(() => setErro("Não foi possível carregar os desbravadores."))
      .finally(() => setCarregando(false));
  }, [unidade.id]);

  return (
    <div className={styles.overlay} onMouseDown={onFechar}>
      <div
        className={styles.modal}
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={`Unidade ${unidade.nome}`}
      >
        <button
          type="button"
          className={styles.fechar}
          onClick={onFechar}
          aria-label="Fechar"
        >
          ×
        </button>

        <h2 className={styles.titulo}>{unidade.nome}</h2>

        <div className={styles.grade}>
          <Campo rotulo="Sexo" valor={unidade.sexo} />
          <Campo rotulo="Faixa Etária" valor={unidade.faixaEtaria} />
          <Campo rotulo="Conselheiro" valor={unidade.conselheiro} />
          <Campo
            rotulo="Desbravadores"
            valor={`${unidade.quantidadeDesbravadores} de ${MAXIMO_DESBRAVADORES}`}
          />
        </div>

        {unidade.inconsistencias.length > 0 && (
          <div className={styles.alerta}>
            <WarningAmberIcon fontSize="small" />
            <ul className={styles.listaAlerta}>
              {unidade.inconsistencias.map((problema) => (
                <li key={problema}>{problema}</li>
              ))}
            </ul>
          </div>
        )}

        <h3 className={styles.subtitulo}>Desbravadores</h3>

        {erro && <p className={styles.erro}>{erro}</p>}

        <div className={styles.lista}>
          {carregando && <p className={styles.vazio}>Carregando...</p>}

          {!carregando && desbravadores.length === 0 && (
            <p className={styles.vazio}>Nenhum desbravador nesta unidade.</p>
          )}

          {desbravadores.map((pessoa) => {
            const idade = idadeEm(pessoa.dataNascimento);

            return (
              <div key={pessoa.id} className={styles.linha}>
                <span className={styles.linhaNome}>{pessoa.nome}</span>
                <span className={styles.linhaDetalhe}>
                  {pessoa.classe || "Sem classe"}
                </span>
                <span className={styles.linhaIdade}>
                  {idade === null ? "—" : `${idade} anos`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default UnidadeDetalheModal;
