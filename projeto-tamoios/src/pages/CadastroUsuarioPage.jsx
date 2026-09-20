import NomePagina from "../components/NomePagina/NomePagina";
import { DashboardLayout } from "../layout/DashboardLayout";
import { Input } from "../components/Input/Input.jsx";
import Select from "../components/Select/Select.jsx";
import { Button } from "../components/Button/Button.jsx";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useEffect, useRef, useState } from "react";
import api from "../services/api.js";
import { InputSenha } from "../components/InputSenha/InputSenha.jsx";
import { useNavigate } from "react-router-dom";

export function CadastroUsuarioPage() {
  const [desbravadores, setDesbravadores] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [termoBusca, setTermoBusca] = useState("");
  const [desbravadorSelecionado, setDesbravadorSelecionado] = useState(null);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const containerBuscaRef = useRef(null);
  const [idCargoSelecionado, setIdCargoSelecionado] = useState("");
  const [idPessoaSelecionado, setIdPessoaSelecionado] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [senhaConfirmacao, setSenhaConfirmacao] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);
  const navigate = useNavigate();
  const handleCadastroUsuario = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/usuarios", {
        idPessoa: idPessoaSelecionado,
        idCargo: idCargoSelecionado,
        email,
        senha,
      });
      alert("Usuário cadastrado com sucesso!");
      navigate("/dashboard");
    } catch (err) {
      console.log(idPessoaSelecionado, idCargoSelecionado, email, senha);
      alert(
        err.response?.data?.message ||
          "Erro ao cadastrar usuário. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ativo = true;

    async function carregarDesbravadores() {
      try {
        const resposta = await api.get(`/pessoas`);

        if (!ativo) {
          return;
        }

        setDesbravadores(Array.isArray(resposta.data) ? resposta.data : []);
        console.log("Desbravadores carregados:", resposta.data);
      } catch (error) {
        if (!ativo) {
          return;
        }

        console.error("Erro ao carregar desbravadores:", error);
        setDesbravadores([]);
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    carregarDesbravadores();

    return () => {
      ativo = false;
    };
  }, []);

  const desbravadoresFiltrados = desbravadores.filter((desbravador) =>
    desbravador?.nome?.toLowerCase().includes(termoBusca.toLowerCase()),
  );

  useEffect(() => {
    function handleCliqueFora(event) {
      if (
        containerBuscaRef.current &&
        !containerBuscaRef.current.contains(event.target)
      ) {
        setMostrarSugestoes(false);
      }
    }

    document.addEventListener("mousedown", handleCliqueFora);

    return () => {
      document.removeEventListener("mousedown", handleCliqueFora);
    };
  }, []);

  const handleSelecionarDesbravador = (desbravador) => {
    setIdPessoaSelecionado(Number(desbravador.idPessoa));
    setDesbravadorSelecionado(desbravador);
    setTermoBusca(desbravador.nome ?? "");
    setMostrarSugestoes(false);
  };

  return (
    <DashboardLayout>
      <NomePagina
        titulo="Cadastrar Usuário"
        subtitulo="Adicionar um novo usuário no clube Tamoios"
      ></NomePagina>
      <section
        style={{
          marginTop: "20px",
          marginBottom: "20px",
          display: "flex",
          gap: "20px",
          alignItems: "center",
          justifyContent: "space-around",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <AccountCircleIcon sx={{ fontSize: 200 }} />
          <Button
            variante="secundario"
            texto={"Adicionar Foto (Opcional)"}
            mensagemAlert={"Funcionalidade ainda não implementada."}
          />
        </div>
        <div>
          {localStorage.getItem("usuario") &&
            JSON.parse(localStorage.getItem("usuario")).nomeCargo !==
              "Diretor" &&
            JSON.parse(localStorage.getItem("usuario")).cargo !==
              "Secretário" && (
              <div
                style={{ color: "red", marginBottom: "15px", fontSize: "16px" }}
              >
                {
                  "Usuário tem que ser Diretor ou Secretário para poder cadastrar uma nova pessoa."
                }
              </div>
            )}
          <form onSubmit={handleCadastroUsuario} action="">
            <label htmlFor="">Cargo:</label>
            <Select
              placeholder="Selecione o cargo"
              onChange={(e) =>
                setIdCargoSelecionado(
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
            >
              <option value="">Selecione o cargo</option>
              <option value="1">Diretor</option>
              <option value="2">Secretário</option>
              <option value="3">Tesoureiro</option>
              <option value="5">Instrutor</option>
            </Select>
            <br />
            <label htmlFor="">Associar Desbravador</label>
            <div
              ref={containerBuscaRef}
              style={{ position: "relative", width: "100%" }}
            >
              <Input
                type="text"
                placeholder="Buscar desbravador pelo nome"
                value={termoBusca}
                onChange={(event) => {
                  const valor = event.target.value;
                  setTermoBusca(valor);
                  setDesbravadorSelecionado(null);
                  setMostrarSugestoes(valor.trim().length > 0);
                }}
                onFocus={() => {
                  if (termoBusca.trim().length > 0) {
                    setMostrarSugestoes(true);
                  }
                }}
                aria-label="Buscar desbravador"
              />

              {mostrarSugestoes &&
                termoBusca &&
                desbravadoresFiltrados.length > 0 &&
                !desbravadorSelecionado && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 5px)",
                      left: 0,
                      right: 0,
                      background: "#fff",
                      border: "1px solid var(--vinhoEscuro)",
                      borderRadius: "5px",
                      maxHeight: "220px",
                      overflowY: "auto",
                      zIndex: 20,
                      boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
                    }}
                  >
                    {desbravadoresFiltrados.map((desbravador) => (
                      <button
                        key={desbravador.idPessoa}
                        type="button"
                        onClick={() => {
                          handleSelecionarDesbravador(desbravador);
                          setTouched(true);
                        }}
                        style={{
                          display: "block",
                          width: "100%",
                          border: "none",
                          background: "#fff",
                          textAlign: "left",
                          padding: "10px 12px",
                          cursor: "pointer",
                          fontFamily: "Fredoka, Inter, sans-serif",
                          color: "#222",
                          transition: "background 0.15s ease",
                        }}
                        onMouseEnter={(event) => {
                          event.currentTarget.style.background = "#f8f3f2";
                        }}
                        onMouseLeave={(event) => {
                          event.currentTarget.style.background = "#fff";
                        }}
                      >
                        {desbravador.nome}
                      </button>
                    ))}
                  </div>
                )}

              {mostrarSugestoes &&
                termoBusca &&
                desbravadoresFiltrados.length === 0 &&
                !carregando &&
                !desbravadorSelecionado && (
                  <div
                    style={{
                      marginTop: "4px",
                      color: "#5c1612",
                      fontSize: "16px",
                    }}
                  >
                    Nenhum desbravador encontrado.
                  </div>
                )}
            </div>
            {!desbravadorSelecionado && touched && (
              <div
                style={{ color: "red", marginBottom: "15px", fontSize: "16px" }}
              >
                {
                  "É necessário selecionar um desbravador para associar ao usuário."
                }
              </div>
            )}
            <br />
            <label htmlFor="">Email:</label>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched(true)}
            />
            {!email && touched && (
              <div
                style={{ color: "red", marginBottom: "15px", fontSize: "16px" }}
              >
                {
                  "É necessário adicionar um email para associar ao usuário. O email será usado para login."
                }
              </div>
            )}
            <br />
            <div style={{ display: "flex", gap: "20px" }}>
              <div>
                <label htmlFor="">Senha:</label>
                <InputSenha
                  placeholder="Sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  disabled={loading}
                  onBlur={() => setTouched(true)}
                />
              </div>
              <div>
                <label htmlFor="">Confirmar Senha:</label>
                <InputSenha
                  placeholder="Confirme sua senha"
                  value={senhaConfirmacao}
                  onChange={(e) => setSenhaConfirmacao(e.target.value)}
                  required
                  disabled={loading}
                  onBlur={() => setTouched(true)}
                />
              </div>
            </div>
            {senha.length < 6 && touched && (
              <div
                style={{ color: "red", marginBottom: "15px", fontSize: "16px" }}
              >
                {
                  "A senha deve ter pelo menos 6 caracteres. Por favor, escolha uma senha mais forte."
                }
              </div>
            )}
            {senha !== senhaConfirmacao && (
              <div
                style={{ color: "red", marginBottom: "15px", fontSize: "16px" }}
              >
                {
                  "As senhas não coincidem. Por favor, verifique e tente novamente."
                }
              </div>
            )}
            <Button
              texto={loading ? "Carregando..." : "Cadastrar Usuário"}
              disabled={
                senha !== senhaConfirmacao ||
                !desbravadorSelecionado ||
                !email ||
                !senha ||
                !senhaConfirmacao ||
                JSON.parse(localStorage.getItem("usuario")).nomeCargo !==
                  "Diretor" ||
                JSON.parse(localStorage.getItem("usuario")).nomeCargo !==
                  "Secretário"
              }
              type="submit"
              larguraTotal
            />
          </form>
        </div>
      </section>
    </DashboardLayout>
  );
}
