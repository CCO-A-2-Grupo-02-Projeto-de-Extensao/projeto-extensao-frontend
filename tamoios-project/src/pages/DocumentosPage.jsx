import NomePagina from "../components/NomePagina/NomePagina.jsx";
import emConstrucao from "../assets/construcao.png";
import { DashboardLayout } from "../layout/DashboardLayout.jsx";

export function DocumentosPage() {
  return (
    <DashboardLayout>
      <NomePagina
        titulo="Documentos"
        subtitulo="Principais documentos relacionados aos desbravadores."
      ></NomePagina>
      <img
        src={emConstrucao}
        alt="Página em construção..."
        style={{ margin: "1.5rem 15rem", width: "45rem" }}
      />
    </DashboardLayout>
  );
}
