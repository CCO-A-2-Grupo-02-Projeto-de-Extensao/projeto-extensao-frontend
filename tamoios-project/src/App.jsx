import "./App.css";
import Login from "./pages/login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import EsqueceuSenhaPage from "./pages/EsqueceuSenhaPage.jsx";
import { CadastroUsuarioPage } from "./pages/CadastroUsuarioPage.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute/ProtectedRoute.jsx";
import { DesbravadoresPage } from "./pages/DesbravadoresPage.jsx";
import { ChamadaPage } from "./pages/ChamadaPage.jsx";
import { ClassesPage } from "./pages/ClassesPage.jsx";
import { EspecialidadesPage } from "./pages/EspecialidadesPage.jsx";
import { DocumentosPage } from "./pages/DocumentosPage.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={<ProtectedRoute element={<Dashboard />} />}
        />
        <Route path="/esqueceuSenhaPage" element={<EsqueceuSenhaPage />} />
        <Route
          path="/dashboard/cadastrar-usuario"
          element={<ProtectedRoute element={<CadastroUsuarioPage />} />}
        />
        <Route
          path="/dashboard/desbravadores"
          element={<ProtectedRoute element={<DesbravadoresPage />} />}
        />
        <Route
          path="/dashboard/chamada"
          element={<ProtectedRoute element={<ChamadaPage />} />}
        />
        <Route
          path="/dashboard/classes"
          element={<ProtectedRoute element={<ClassesPage />} />}
        />
        <Route
          path="/dashboard/especialidades"
          element={<ProtectedRoute element={<EspecialidadesPage />} />}
        />
        <Route
          path="/dashboard/documentos"
          element={<ProtectedRoute element={<DocumentosPage />} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
