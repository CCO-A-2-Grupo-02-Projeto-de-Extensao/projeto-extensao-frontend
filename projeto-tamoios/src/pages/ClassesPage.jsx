import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { DashboardLayout } from "../layout/DashboardLayout.jsx";
import { NomePagina } from "../components/NomePagina/NomePagina.jsx";
import { ClasseCard } from "../components/ClasseCard/ClasseCard.jsx";
import { Select } from "../components/Select/Select.jsx";
import { Input } from "../components/Input/Input.jsx";

import { getClasses } from "../services/classesService.js";

import styles from "../styles/classesPage.module.css";

export function ClassesPage() {
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [ordenacao, setOrdenacao] = useState("az");
  const [busca, setBusca] = useState("");

  useEffect(() => {
    let ativo = true;

    getClasses()
      .then((lista) => {
        if (!ativo) return;
        setClasses(lista);
        setCarregando(false);
      })
      .catch(() => {
        if (!ativo) return;
        setErro("Não foi possível carregar as classes.");
        setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  const classesFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return [...classes]
      .filter((classe) => classe.nome.toLowerCase().includes(termo))
      .sort((a, b) =>
        ordenacao === "az"
          ? a.nome.localeCompare(b.nome)
          : b.nome.localeCompare(a.nome)
      );
  }, [classes, busca, ordenacao]);

  const abrirClasse = (classe) => {
    navigate(`/dashboard/classes/${classe.id}`);
  };

  return (
    <DashboardLayout>
      <NomePagina titulo="Classes" subtitulo="Resumo das classes" />

      <div className={styles.filtros}>
        <div className={styles.campoOrdenacao}>
          <Select
            value={ordenacao}
            onChange={(e) => setOrdenacao(e.target.value)}
            aria-label="Ordenação das classes"
          >
            <option value="az">Ordem crescente (classes)</option>
            <option value="za">Ordem decrescente (classes)</option>
          </Select>
        </div>

        <div className={styles.campoBusca}>
          <Input
            type="search"
            placeholder="Busque pelo nome de uma classe"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            aria-label="Buscar classe por nome"
          />
        </div>
      </div>

      {carregando && <p className={styles.mensagemEstado}>Carregando classes...</p>}

      {!carregando && erro && (
        <p className={styles.mensagemErro}>{erro}</p>
      )}

      {!carregando && !erro && classesFiltradas.length === 0 && (
        <p className={styles.mensagemEstado}>Nenhuma classe encontrada.</p>
      )}

      {!carregando && !erro && classesFiltradas.length > 0 && (
        <div className={styles.grade}>
          {classesFiltradas.map((classe) => (
            <ClasseCard key={classe.id} classe={classe} onAbrir={abrirClasse} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

export default ClassesPage;
