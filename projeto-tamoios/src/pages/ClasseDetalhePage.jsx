import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { DashboardLayout } from "../layout/DashboardLayout.jsx";
import { ClasseParticipantes } from "../components/ClasseParticipantes/ClasseParticipantes.jsx";
import { ClasseEspecialidades } from "../components/ClasseEspecialidades/ClasseEspecialidades.jsx";
import { ClasseUnidades } from "../components/ClasseUnidades/ClasseUnidades.jsx";

import { getClasse } from "../services/classesService.js";

import styles from "../styles/classeDetalhePage.module.css";

const ABAS = [
  { id: "participantes", rotulo: "Participantes" },
  { id: "especialidades", rotulo: "Especialidades" },
  { id: "unidades", rotulo: "Unidades" },
];

export function ClasseDetalhePage() {
  const { idClasse } = useParams();
  const navigate = useNavigate();

  const [classe, setClasse] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [abaAtiva, setAbaAtiva] = useState("participantes");

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

  return (
    <DashboardLayout>
      <button
        type="button"
        className={styles.voltar}
        onClick={() => navigate("/dashboard/classes")}
      >
        <ArrowBackIcon fontSize="small" />
        Voltar para as classes
      </button>

      <h1 className={styles.titulo}>
        {carregando ? "Carregando..." : `Classe ${classe?.nome ?? ""}`}
      </h1>

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
    </DashboardLayout>
  );
}

export default ClasseDetalhePage;
