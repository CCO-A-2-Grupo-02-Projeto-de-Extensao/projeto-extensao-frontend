import { useEffect, useState } from "react";
import NomePagina from "../components/NomePagina/NomePagina.jsx";
import { DashboardLayout } from "../layout/DashboardLayout.jsx";
import Documento from "../components/Documento/Documento.jsx";
import styles from "../styles/documentoPage.module.css";
import api from "../services/api.js";

export function DocumentosPage() {
  const [documentos, setDocumentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    function obterIdPessoa() {
      const usuarioSalvo = localStorage.getItem("usuario");

      if (!usuarioSalvo) {
        return null;
      }

      try {
        const usuario = JSON.parse(usuarioSalvo);
        const idUsuario = Number(usuario?.idUsuario);

        return Number.isInteger(idUsuario) ? idUsuario : null;
      } catch {
        return null;
      }
    }

    async function carregarDocumentos() {
      const idPessoa = obterIdPessoa();

      if (!idPessoa) {
        setCarregando(false);
        setErro("Nenhum usuário válido foi encontrado no navegador.");
        setDocumentos([]);
        return;
      }

      try {
        setCarregando(true);
        setErro("");

        const resposta = await api.get(`/documentos/pessoa/${idPessoa}`);

        if (!ativo) {
          return;
        }

        setDocumentos(Array.isArray(resposta.data) ? resposta.data : []);
      } catch (error) {
        if (!ativo) {
          return;
        }

        console.error("Erro ao carregar documentos:", error);
        setErro("Não foi possível carregar os documentos desta pessoa.");
        setDocumentos([]);
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    carregarDocumentos();

    return () => {
      ativo = false;
    };
  }, []);

  return (
    <DashboardLayout>
      <NomePagina
        titulo="Documentos"
        subtitulo="Principais documentos do clube"
      ></NomePagina>
      <section className={styles.listaDocumento}>
        {carregando && <p>Carregando documentos...</p>}

        {!carregando && erro && <p>{erro}</p>}

        {!carregando && !erro && documentos.length === 0 && (
          <p>Nenhum documento encontrado para esta pessoa.</p>
        )}

        {!carregando && !erro && documentos.length > 0 && (
          <ul>
            {documentos.map((documento) => (
              <li key={documento.id}>
                <Documento
                  idDocumento={documento.id}
                  nome={documento.nomeOriginal}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </DashboardLayout>
  );
}
