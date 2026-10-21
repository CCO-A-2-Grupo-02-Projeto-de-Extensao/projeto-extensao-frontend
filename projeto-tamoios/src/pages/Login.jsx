import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import desbravadoresLogoImg from "../assets/desbravadores_logo.png";
import "../App.css";
import { Button } from "../components/Button/Button.jsx";
import styles from "../styles/login.module.css";
import { Input } from "../components/Input/Input.jsx";
import { InputSenha } from "../components/InputSenha/InputSenha.jsx";
import { Modal } from "../components/Modal/Modal.jsx";
import api from "../services/api.js";
import { ActionButton } from "../components/ActionButton/ActionButton.jsx";
import { EsqueceuSenhaModal } from "../components/EsqueceuSenhaModal/EsqueceuSenhaModal.jsx";
import { Cortina } from "../components/Cortina/Cortina.jsx";
import { InterruptorTema } from "../components/InterruptorTema/InterruptorTema.jsx";
import { prefereMenosMovimento } from "../utils/movimento.js";

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [modalEsqueceuSenhaAberto, setModalEsqueceuSenhaAberto] =
    useState(false);
  const [origemEntrada, setOrigemEntrada] = useState(null);
  const revelando = location.state?.saida && !prefereMenosMovimento();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro("");
    setLoading(true);

    const botao = e.nativeEvent.submitter;

    try {
      const { data } = await api.post("/usuarios/login", { email, senha });
      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(data));

      if (prefereMenosMovimento() || !botao) {
        navigate("/dashboard");
        return;
      }
      const r = botao.getBoundingClientRect();
      const x = r.left + r.width / 2;
      const y = r.top + r.height / 2;
      const raio = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );
      setOrigemEntrada({ x, y, raio });
    } catch (err) {
      setErro(
        err.response?.data?.message ||
          (err.response?.status === 401
            ? "Email ou senha inválidos."
            : "Erro ao fazer login. Tente novamente."),
      );
      setLoading(false);
    }
  };

  return (
    <section id="center">
      <div className={styles.cantoTema}>
        <InterruptorTema />
      </div>
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
          <ActionButton
            texto="Esqueceu a Senha ?"
            onClick={() => setModalEsqueceuSenhaAberto(true)}
          />
        </form>
      </Modal>
      <EsqueceuSenhaModal
        aberto={modalEsqueceuSenhaAberto}
        onFechar={() => setModalEsqueceuSenhaAberto(false)}
        //onCadastrar={aoCadastrarMembro}
      />
      {origemEntrada && (
        <Cortina
          variante="abrir"
          origem={origemEntrada}
          onFim={() => navigate("/dashboard", { state: { entrada: true } })}
        />
      )}
      {revelando && (
        <Cortina
          variante="revelar"
          onFim={() => navigate("/", { replace: true })}
        />
      )}
    </section>
  );
}

export default Login;
