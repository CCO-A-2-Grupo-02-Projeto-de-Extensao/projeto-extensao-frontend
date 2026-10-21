import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useEstadoDaTela } from "../hooks/useEstadoDaTela.js";
import { useVoltar } from "../hooks/useVoltar.js";
import { Tooltip } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { ClasseParticipantes } from "../components/ClasseParticipantes/ClasseParticipantes.jsx";
import { ClasseEspecialidades } from "../components/ClasseEspecialidades/ClasseEspecialidades.jsx";
import { ClasseUnidades } from "../components/ClasseUnidades/ClasseUnidades.jsx";

import { getClasse } from "../services/classesService.js";
import { visualDaClasse } from "../utils/classesVisual.js";

import detalhe from "../styles/desbravadorDetalhePage.module.css";
import styles from "../styles/classeDetalhePage.module.css";

const ABAS = [
  { id: "participantes", rotulo: "Participantes" },
  { id: "especialidades", rotulo: "Especialidades" },
  { id: "unidades", rotulo: "Unidades" },
];

export function ClasseDetalhePage() {
  const voltar = useVoltar("/dashboard/classes");
  const { idClasse } = useParams();

  const [classe, setClasse] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [abaAtiva, setAbaAtiva] = useEstadoDaTela("abaAtiva", "participantes");

  useEffect(() => {
    let ativo = true;

    getClasse(idClasse)
      .then((dados) => {
        if (!ativo) return;
        setClasse(dados);
        setCarregando(false);
      })
      .catch(() => {
        if (!ativo) return;
        setErro("Não foi possível carregar a classe.");
        setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [idClasse]);

  const visual = visualDaClasse(classe?.nome);

  return (
    // --cor-classe tinge o ponto do cabeçalho e a aba ativa.
    <div style={{ "--cor-classe": visual.cor }}>
      <header className={detalhe.cabecalho}>
        <Tooltip arrow placement="bottom" title="Voltar para a tela anterior">
          <button
            type="button"
            className={detalhe.botaoVoltar}
            onClick={voltar}
          >
            <ArrowBackIcon fontSize="small" />
          </button>
        </Tooltip>

        <div className={detalhe.cabecalhoTextos}>
          <p className={detalhe.sobretitulo}>
            <span className={styles.pontoCor} aria-hidden="true" />
            Clube Tamoios
            {!carregando && !erro && visual.idade && (
              <span className={detalhe.matricula}>
                {visual.idade} anos • Regular
              </span>
            )}
          </p>
          <h1 className={detalhe.titulo}>
            {carregando ? "Carregando..." : `Classe ${classe?.nome ?? ""}`}
          </h1>
          <p className={detalhe.subtitulo}>
            Participantes, especialidades e unidades desta classe.
          </p>
        </div>
      </header>

      <nav className={styles.abas} aria-label="Seções da classe">
        {ABAS.map((aba) => (
          <button
            key={aba.id}
            type="button"
            className={`${styles.aba} ${
              abaAtiva === aba.id ? styles.abaAtiva : ""
            }`}
            onClick={() => setAbaAtiva(aba.id)}
            aria-current={abaAtiva === aba.id ? "page" : undefined}
          >
            {aba.rotulo}
          </button>
        ))}
      </nav>

      {erro && <p className={styles.mensagemErro}>{erro}</p>}

      {!erro && !carregando && (
        <div className={styles.conteudo}>
          {abaAtiva === "participantes" && (
            <ClasseParticipantes idClasse={idClasse} />
          )}

          {abaAtiva === "especialidades" && (
            <ClasseEspecialidades idClasse={idClasse} />
          )}

          {abaAtiva === "unidades" && (
            <ClasseUnidades idClasse={idClasse} nomeClasse={classe?.nome} />
          )}
        </div>
      )}
    </div>
  );
}

export default ClasseDetalhePage;
