import NomePagina from "../components/NomePagina/NomePagina.jsx";
import emConstrucao from "../assets/construcao.png";
import { DashboardLayout } from "../layout/DashboardLayout.jsx";

export function ClassesPage() {
  return (
    <DashboardLayout>
      <NomePagina
        titulo="Classes"
        subtitulo="Resumo das classes do clube"
      ></NomePagina>
      <img
        src={emConstrucao}
        alt="Página em construção..."
        style={{ margin: "1.5rem 15rem", width: "45rem" }}
      />
    </DashboardLayout>
  );
}
