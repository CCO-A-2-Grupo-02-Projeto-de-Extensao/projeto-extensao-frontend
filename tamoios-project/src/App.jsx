import { useState } from "react";
import "./App.css";
import Login from "./pages/login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import EsqueceuSenhaPage from "./pages/EsqueceuSenhaPage.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/esqueceuSenhaPage" element={<EsqueceuSenhaPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
