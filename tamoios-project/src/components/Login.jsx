import desbravadoresLogoImg from "../assets/desbravadores_logo.png";
import "../App.css";
import { Button } from "./Button/Button.jsx";
import { Input } from "./Input/Input.jsx";

function Login() {
  return (
    <section id="center">
      <div className="modal">
        <div className="hero">
          <img
            src={desbravadoresLogoImg}
            className="base"
            alt="Logo dos Desbravadores"
            style={{ width: "90px", height: "auto" }}
          />
        </div>
        <h1>Portal de Gestão - Clube Tamoios</h1>
        <Input type="email" placeholder="Seu email" />
        <br />
        <Input type="password" placeholder="Sua senha" />
        <br />
        <Button
          texto={"Esqueceu a senha ?"}
          pagina={"esqueceuSenhaPage"}
        ></Button>
        <br />
        <Button texto={"Entrar"} pagina={"dashboard"}></Button>
      </div>
    </section>
  );
}

export default Login;
