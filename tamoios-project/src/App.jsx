import { useState } from "react";
import "./App.css";
import Login from "./pages/login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import EsqueceuSenhaPage from "./pages/EsqueceuSenhaPage.jsx";
import { CadastroUsuarioPage } from "./pages/CadastroUsuarioPage.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute/ProtectedRoute.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
        <Route path="/esqueceuSenhaPage" element={<EsqueceuSenhaPage />} />
        <Route
          path="/dashboard/cadastrar-usuario"
          element={<ProtectedRoute element={<CadastroUsuarioPage />} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
