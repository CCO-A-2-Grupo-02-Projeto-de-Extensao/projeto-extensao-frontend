import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEstadoDaTela } from "../hooks/useEstadoDaTela.js";
import { useVoltar } from "../hooks/useVoltar.js";
import { Tooltip } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";

import { ClasseCard } from "../components/ClasseCard/ClasseCard.jsx";
import { Select } from "../components/Select/Select.jsx";
import { Input } from "../components/Input/Input.jsx";
import { Esqueleto } from "../components/Esqueleto/Esqueleto.jsx";

import { getClasses } from "../services/classesService.js";
import { getMembros } from "../services/membrosService.js";
import { visualDaClasse } from "../utils/classesVisual.js";

import detalhe from "../styles/desbravadorDetalhePage.module.css";
import styles from "../styles/classesPage.module.css";

function obterIdadeDaClasse(classe) {
  if (typeof classe?.idade === "number" && !isNaN(classe.idade)) {
    return classe.idade;
  }
  const visual = visualDaClasse(classe?.nome);
  return typeof visual?.idade === "number" ? visual.idade : null;
}

export function ClassesPage() {
  const navigate = useNavigate();
  const voltar = useVoltar("/dashboard");

  const [classes, setClasses] = useState([]);
  // null = não foi possível carregar os membros (os cards ficam sem avatares).
  const [membros, setMembros] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [ordenacao, setOrdenacao] = useEstadoDaTela("ordenacao", "crescente");
  const [busca, setBusca] = useEstadoDaTela("busca", "");

  useEffect(() => {
    let ativo = true;

    Promise.allSettled([getClasses(), getMembros()]).then(
      ([resClasses, resMembros]) => {
        if (!ativo) return;

        if (resClasses.status === "fulfilled") {
          setClasses(resClasses.value);
        } else {
          setErro("Não foi possível carregar as classes.");
        }

        if (resMembros.status === "fulfilled") {
          setMembros(resMembros.value.filter((m) => m.ativo !== false));
        }

        setCarregando(false);
      }
    );

    return () => {
      ativo = false;
    };
  }, []);

  // Desbravadores ativos de cada classe, em ordem alfabética, e o total de
  // inscritos (cada pessoa conta uma vez só).
  const { porClasse, inscritos } = useMemo(() => {
    if (!membros) return { porClasse: null, inscritos: null };

    const mapa = new Map();
    const ids = new Set();

    classes.forEach((classe) => {
      const lista = membros
        .filter(
          (m) =>
            (m.idClasse != null && String(m.idClasse) === String(classe.id)) ||
            (m.classe && m.classe === classe.nome)
        )
        .sort((a, b) => a.nome.localeCompare(b.nome));

      lista.forEach((m) => ids.add(m.id));
      mapa.set(classe.id, lista);
    });

    return { porClasse: mapa, inscritos: ids.size };
  }, [classes, membros]);

  const termo = busca.trim().toLowerCase();
  const bateComBusca = (membro) => membro.nome.toLowerCase().includes(termo);

  // A busca é por desbravador: sobram as classes que têm alguém com esse nome.
  const classesFiltradas = useMemo(() => {
    return [...classes]
      .filter((classe) => {
        if (!termo) return true;
        if (!porClasse) return false;
        return (porClasse.get(classe.id) ?? []).some(bateComBusca);
      })
      .sort((a, b) => {
        const idadeA = obterIdadeDaClasse(a);
        const idadeB = obterIdadeDaClasse(b);
        const ehCrescente = ordenacao === "crescente" || ordenacao === "az";

        if (idadeA !== null && idadeB !== null && idadeA !== idadeB) {
          return ehCrescente ? idadeA - idadeB : idadeB - idadeA;
        }
        if (idadeA !== null && idadeB === null) return -1;
        if (idadeA === null && idadeB !== null) return 1;

        return ehCrescente
          ? a.nome.localeCompare(b.nome)
          : b.nome.localeCompare(a.nome);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- bateComBusca só depende de `termo`
  }, [classes, porClasse, termo, ordenacao]);

  const abrirClasse = (classe) => {
    navigate(`/dashboard/classes/${classe.id}`);
  };

  return (
    <>
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
            Clube Tamoios
            {!carregando && !erro && (
              <span className={detalhe.matricula}>
                {classes.length} {classes.length === 1 ? "classe" : "classes"}
              </span>
            )}
          </p>
          <h1 className={detalhe.titulo}>Classes</h1>
          <p className={detalhe.subtitulo}>
            Resumo das classes do clube e dos desbravadores de cada uma.
          </p>
        </div>

        <div className={detalhe.cabecalhoAcoes}>
          <div className={styles.kpi}>
            <div className={styles.kpiIconeWrap}>
              <GroupRoundedIcon fontSize="small" />
            </div>
            <div className={styles.kpiTexto}>
              <strong>{carregando || inscritos === null ? "—" : inscritos}</strong>
              <span>Inscritos</span>
            </div>
          </div>
        </div>
      </header>

      <div className={styles.filtros}>
        <div className={styles.campoBusca}>
          <Input
            type="search"
            placeholder="Busque pelo nome de um desbravador"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            aria-label="Buscar desbravador por nome"
          />
        </div>

        <div className={styles.campoOrdenacao}>
          <Select
            value={ordenacao}
            onChange={(e) => setOrdenacao(e.target.value)}
            aria-label="Ordenação das classes"
          >
            <option value="crescente">Ordem crescente (idade)</option>
            <option value="decrescente">Ordem decrescente (idade)</option>
          </Select>
        </div>
      </div>

      {carregando && (
        <Esqueleto linhas={3} altura={120} rotulo="Carregando classes" />
      )}

      {!carregando && erro && <p className={styles.mensagemErro}>{erro}</p>}

      {!carregando && !erro && classesFiltradas.length === 0 && (
        <p className={styles.mensagemEstado}>
          {termo ? "Nenhum desbravador encontrado." : "Nenhuma classe encontrada."}
        </p>
      )}

      {!carregando && !erro && classesFiltradas.length > 0 && (
        <div className={styles.grade}>
          {classesFiltradas.map((classe, indice) => {
            const lista = porClasse ? porClasse.get(classe.id) ?? [] : null;
            const exibidos = lista && termo ? lista.filter(bateComBusca) : lista;

            return (
              <ClasseCard
                key={classe.id}
                classe={classe}
                participantes={exibidos}
                total={lista ? lista.length : null}
                buscando={Boolean(termo)}
                indice={indice}
                onAbrir={abrirClasse}
              />
            );
          })}
        </div>
      )}
    </>
  );
}

export default ClassesPage;
