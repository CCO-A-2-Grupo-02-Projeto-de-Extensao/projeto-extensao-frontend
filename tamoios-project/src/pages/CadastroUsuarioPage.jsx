import NomePagina from "../components/NomePagina/NomePagina";
import { DashboardLayout } from "../layout/DashboardLayout";

export function CadastroUsuarioPage() {
  return (
    <DashboardLayout>
      <NomePagina
        titulo="Cadastrar Usuário"
        subtitulo="Adicionar um novo úsuario no clube Tamoios"
      ></NomePagina>
    </DashboardLayout>
  );
}
