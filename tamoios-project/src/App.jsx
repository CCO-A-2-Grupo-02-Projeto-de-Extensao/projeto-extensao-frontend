import { useState } from "react";
import aranduLogoImg from "./assets/arandu_logo.png";
import tamoiosLogoImg from "./assets/clube_tamoios_logo.webp";
import "./App.css";

function App() {
  return (
    <section id="center">
      <div class="modal">
        <div className="hero">
          <img src={aranduLogoImg} className="base" alt="" />
          <img src={tamoiosLogoImg} className="base" alt="" />
        </div>
        <h1>Portal de Gestão - Clube Tamoios</h1>
        <input type="text" name="" id="" placeholder="Usuário" />
        <br />
        <input type="password" name="" id="" placeholder="Senha" />
        <br />
        <button>Esqueceu a senha ?</button>
        <br />
        <button>Entrar</button>
      </div>
    </section>
  );
}

export default App;
