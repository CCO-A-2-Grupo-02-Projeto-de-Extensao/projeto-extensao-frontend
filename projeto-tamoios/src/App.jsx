import "./App.css";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import EsqueceuSenhaPage from "./pages/EsqueceuSenhaPage.jsx";
import { CadastroUsuarioPage } from "./pages/CadastroUsuarioPage.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute/ProtectedRoute.jsx";
import { DesbravadoresPage } from "./pages/DesbravadoresPage.jsx";
import { ChamadaPage } from "./pages/ChamadaPage.jsx";
import { ClassesPage } from "./pages/ClassesPage.jsx";
import { ClasseDetalhePage } from "./pages/ClasseDetalhePage.jsx";
import { EspecialidadesPage } from "./pages/EspecialidadesPage.jsx";
import { DocumentosPage } from "./pages/DocumentosPage.jsx";
import { DesbravadorDetalhePage } from "./pages/DesbravadorDetalhePage.jsx";
import { DashboardLayout } from "./layout/DashboardLayout.jsx";
import { CadastroDesbravadorPage } from "./pages/CadastroDesbravadorPage.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/esqueceuSenhaPage" element={<EsqueceuSenhaPage />} />
        <Route element={<ProtectedRoute element={<DashboardLayout />} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
            path="/dashboard/cadastrar-usuario"
            element={<CadastroUsuarioPage />}
          />
          <Route
            path="/dashboard/desbravadores"
            element={<DesbravadoresPage />}
          />
          <Route
            path="/dashboard/desbravadores/novo"
            element={<CadastroDesbravadorPage />}
          />
          <Route
            path="/dashboard/desbravadores/:idPessoa"
            element={<DesbravadorDetalhePage />}
          />
          <Route path="/dashboard/chamada" element={<ChamadaPage />} />
          <Route path="/dashboard/classes" element={<ClassesPage />} />
          <Route
            path="/dashboard/classes/:idClasse"
            element={<ClasseDetalhePage />}
          />
          <Route
            path="/dashboard/especialidades"
            element={<EspecialidadesPage />}
          />
          <Route path="/dashboard/documentos" element={<DocumentosPage />} />
        </Route>
        <Route element={<DashboardLayout />}>
          <Route path="/preview/chamada" element={<ChamadaPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
