import NomePagina from "../components/NomePagina/NomePagina";
import { DashboardLayout } from "../layout/DashboardLayout";
import { Input } from "../components/Input/Input.jsx";
import Select from "../components/Select/Select.jsx";
import { Button } from "../components/Button/Button.jsx";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useEffect, useRef, useState } from "react";
import api from "../services/api.js";

export function CadastroUsuarioPage() {
  const [desbravadores, setDesbravadores] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [termoBusca, setTermoBusca] = useState("");
  const [desbravadorSelecionado, setDesbravadorSelecionado] = useState(null);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const containerBuscaRef = useRef(null);

  useEffect(() => {
    let ativo = true;

    async function carregarDesbravadores() {
      try {
        const resposta = await api.get(`/pessoas`);

        if (!ativo) {
          return;
        }

        setDesbravadores(Array.isArray(resposta.data) ? resposta.data : []);
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
            mensagemAlert={"Foto adicionada com sucesso !"}
          />
        </div>
        <div>
          <form action="">
            <label htmlFor="">Cargo:</label>
            <Select placeholder="Selecione o cargo">
              <option value="">Selecione o cargo</option>
              <option value="1">Diretor</option>
              <option value="2">Secretário</option>
              <option value="3">Tesoureiro</option>
              <option value="3">Instrutor</option>
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
                        onClick={() => handleSelecionarDesbravador(desbravador)}
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
                      fontSize: "14px",
                    }}
                  >
                    Nenhum desbravador encontrado.
                  </div>
                )}
            </div>
            <br />
            <label htmlFor="">Email:</label>
            <Input type="email" placeholder="Email" />
            <br />
            <div style={{ display: "flex", gap: "20px" }}>
              <div>
                <label htmlFor="">Senha:</label>
                <Input type="password" placeholder="Senha" />
              </div>
              <div>
                <label htmlFor="">Confirmar Senha:</label>
                <Input type="password" placeholder="Confirmar Senha" />
              </div>
            </div>
          </form>
        </div>
      </section>
      <Button
        texto={"Adicionar Usuário"}
        mensagemAlert={"Usuário cadastrado com sucesso !"}
        larguraTotal
      />
    </DashboardLayout>
  );
}
