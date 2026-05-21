import { useState } from "react";
import "./App.css";
import Login from "./components/login.jsx";
import Dashboard from "./components/Dashboard.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import EsqueceuSenhaPage from "./components/EsqueceuSenhaPage.jsx";

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
