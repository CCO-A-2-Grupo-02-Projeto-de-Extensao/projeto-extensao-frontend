import NomePagina from "../components/NomePagina/NomePagina.jsx";
import emConstrucao from "../assets/construcao.png";
import { DashboardLayout } from "../layout/DashboardLayout.jsx";

export function EspecialidadesPage() {
  return (
    <DashboardLayout>
      <NomePagina
        titulo="Especialidades"
        subtitulo="Resumo das disciplinas e requisitos para os desbravadores."
      ></NomePagina>
      <img
        src={emConstrucao}
        alt="Página em construção..."
        style={{ margin: "1.5rem 15rem", width: "45rem" }}
      />
    </DashboardLayout>
  );
}
