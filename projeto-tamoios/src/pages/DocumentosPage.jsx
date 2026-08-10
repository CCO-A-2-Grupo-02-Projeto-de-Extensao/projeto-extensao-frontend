import NomePagina from "../components/NomePagina/NomePagina.jsx";
import emConstrucao from "../assets/construcao.png";
import { DashboardLayout } from "../layout/DashboardLayout.jsx";
import TextSnippetIcon from "@mui/icons-material/TextSnippet";
import Documento from "../components/Documento/Documento.jsx";
import styles from "../styles/documentoPage.module.css";
import api from "../services/api.js";

export function DocumentosPage() {
  return (
    <DashboardLayout>
      <NomePagina
        titulo="Documentos"
        subtitulo="Principais documentos do clube"
      ></NomePagina>
      <li className={styles.listaDocumento}>
        <ul>
          <Documento nome="Documento A - teste A"></Documento>
        </ul>
        <ul>
          <Documento nome="Documento B - teste B"></Documento>
        </ul>
        <ul>
          <Documento nome="Documento C - teste C"></Documento>
        </ul>
      </li>
    </DashboardLayout>
  );
}
