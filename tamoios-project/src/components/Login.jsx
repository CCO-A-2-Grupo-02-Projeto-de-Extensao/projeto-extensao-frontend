import { useState } from "react";
import aranduLogoImg from "../assets/arandu_logo.png";
import tamoiosLogoImg from "../assets/clube_tamoios_logo.webp";
import "../App.css";
import Dashboard from "./Dashboard.jsx";
import { Button } from "./Button/Button.jsx";
import { Input } from "./Input/Input.jsx";

function Login() {
  return (
    <section id="center">
      <div className="modal">
        <div className="hero">
          <img
            src={aranduLogoImg}
            className="base"
            alt=""
            style={{ width: "200px" }}
          />
          <img
            src={tamoiosLogoImg}
            className="base"
            alt=""
            style={{ width: "200px" }}
          />
        </div>
        <h1>Portal de Gestão - Clube Tamoios</h1>
        <Input type="email" placeholder="Seu email" />
        <br />
        <Input type="password" placeholder="Sua senha" />
        <br />
        <Button>Esqueceu a senha ?</Button>
        <br />
        <Button>Entrar</Button>
      </div>
    </section>
  );
}

export default Login;
