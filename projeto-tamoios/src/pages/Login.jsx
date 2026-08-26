import { useState } from "react";
import { useNavigate } from "react-router-dom";
import desbravadoresLogoImg from "../assets/desbravadores_logo.png";
import "../App.css";
import { Button } from "../components/Button/Button.jsx";
import styles from "../styles/login.module.css";
import { Input } from "../components/Input/Input.jsx";
import { InputSenha } from "../components/InputSenha/InputSenha.jsx";
import { Modal } from "../components/Modal/Modal.jsx";
import api from "../services/api.js";

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
      const { data } = await api.post("/usuarios/login", { email, senha });
      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(data));
      navigate("/dashboard");
    } catch (err) {
      setErro(
        err.response?.data?.message ||
          (err.response?.status === 401
            ? "Email ou senha inválidos."
            : "Erro ao fazer login. Tente novamente.")
      );
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

        <form onSubmit={handleLogin} className={styles.formulario}>
          <Input
            type="email"
            placeholder="Seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <InputSenha
            placeholder="Sua senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            disabled={loading}
          />
          <Button type="submit" disabled={loading} larguraTotal>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
          <Button
            variante="secundario"
            texto={"Esqueceu a senha ?"}
            pagina={"esqueceuSenhaPage"}
            larguraTotal
          />
        </form>
      </Modal>
    </section>
  );
}

export default Login;
