import { useEffect, useState } from "react";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CloseIcon from "@mui/icons-material/Close";

import { Button } from "../Button/Button.jsx";
import { Avatar } from "../Avatar/Avatar.jsx";
import { useFecharAoClicarFora } from "../../hooks/useFecharAoClicarFora.js";
import { getDesbravadoresDaUnidade } from "../../services/classesService.js";
import {
  MAXIMO_DESBRAVADORES,
  idadeEm,
} from "../../utils/regrasUnidade.js";

import casca from "../../styles/cascaModal.module.css";
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
  const fecharAoClicarFora = useFecharAoClicarFora(onFechar);

  useEffect(() => {
    getDesbravadoresDaUnidade(unidade.id)
      .then(setDesbravadores)
      .catch(() => setErro("Não foi possível carregar os desbravadores."))
      .finally(() => setCarregando(false));
  }, [unidade.id]);

  return (
    <div className={casca.overlay} {...fecharAoClicarFora}>
      <div
        className={`${casca.modal} ${styles.modal}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-unidade-detalhe"
      >
        <div className={casca.cabecalho}>
          <div>
            <h2 id="titulo-unidade-detalhe" className={casca.titulo}>
              {unidade.nome}
            </h2>
            <span className={casca.subtitulo}>
              {unidade.quantidadeDesbravadores} de {MAXIMO_DESBRAVADORES}{" "}
              desbravadores
            </span>
          </div>
          <Button variante="fechar" onClick={onFechar} aria-label="Fechar">
            <CloseIcon />
          </Button>
        </div>

        <div className={casca.corpo}>
          <div className={styles.grade}>
            <Campo rotulo="Sexo" valor={unidade.sexo} />
            <Campo rotulo="Faixa etária" valor={unidade.faixaEtaria} />
            <Campo rotulo="Conselheiro" valor={unidade.conselheiro} />
          </div>

          {unidade.inconsistencias.length > 0 && (
            <div className={casca.alerta}>
              <WarningAmberIcon fontSize="small" />
              <ul className={styles.listaAlerta}>
                {unidade.inconsistencias.map((problema) => (
                  <li key={problema}>{problema}</li>
                ))}
              </ul>
            </div>
          )}

          {erro && <p className={casca.erro}>{erro}</p>}

          <h3 className={casca.secaoTitulo}>Desbravadores</h3>

          <div className={casca.lista}>
            {carregando && <p className={casca.vazio}>Carregando...</p>}

            {!carregando && desbravadores.length === 0 && (
              <p className={casca.vazio}>Nenhum desbravador nesta unidade.</p>
            )}

            {desbravadores.map((pessoa) => {
              const idade = idadeEm(pessoa.dataNascimento);

              return (
                <div key={pessoa.id} className={casca.linha}>
                  <Avatar nome={pessoa.nome} tamanho={32} />
                  <span className={casca.linhaTextos}>
                    <span className={casca.linhaNome}>{pessoa.nome}</span>
                    <span className={casca.linhaDetalhe}>
                      {pessoa.classe || "Sem classe"}
                    </span>
                  </span>
                  <span className={styles.idade}>
                    {idade === null ? "—" : `${idade} anos`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UnidadeDetalheModal;
