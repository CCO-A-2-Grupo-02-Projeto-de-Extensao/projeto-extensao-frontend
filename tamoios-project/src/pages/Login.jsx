import { useState } from "react";
import { useNavigate } from "react-router-dom";
import desbravadoresLogoImg from "../assets/desbravadores_logo.png";
import "../App.css";
import { Button } from "../components/Button/Button.jsx";
import { Input } from "../components/Input/Input.jsx";
import { Modal } from "../components/Modal/MOdal.jsx";

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/usuarios/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, senha }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Email ou senha inválidos."
        );
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(data));
      navigate("/dashboard");
    } catch (err) {
      setErro(err.message || "Erro ao fazer login. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="center">
      <Modal>
        <div className="hero">
          <img
            src={desbravadoresLogoImg}
            className="base"
            alt="Logo dos Desbravadores"
            style={{ width: "90px", height: "auto" }}
          />
        </div>
        <h1>Portal de Gestão - Clube Tamoios</h1>

        {erro && (
          <div style={{ color: "red", marginBottom: "15px", fontSize: "14px" }}>
            {erro}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <Input
            type="email"
            placeholder="Seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <br />
          <Input
            type="password"
            placeholder="Sua senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            disabled={loading}
          />
          <br />
          <Button
            texto={"Esqueceu a senha ?"}
            pagina={"esqueceuSenhaPage"}
          ></Button>
          <br />
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "10px 20px",
              backgroundColor: loading ? "#ccc" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "16px",
              width: "100%",
            }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </Modal>
    </section>
  );
}

export default Login;
