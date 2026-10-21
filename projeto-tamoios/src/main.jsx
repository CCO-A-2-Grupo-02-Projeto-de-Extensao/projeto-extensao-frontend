import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/500.css";
import "@fontsource/plus-jakarta-sans/600.css";
import "@fontsource/plus-jakarta-sans/700.css";
import "@fontsource/plus-jakarta-sans/800.css";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { aplicarTema, lerTema } from "./utils/tema.js";

aplicarTema(lerTema());

// Adicionando o VLibras
const initVLibras = () => {
  if (window.VLibras) {
    new window.VLibras.Widget('https://vlibras.gov.br/app');
    return;
  }
  const s = document.createElement('script');
  s.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
  s.async = true;
  s.onload = () => new window.VLibras.Widget('https://vlibras.gov.br/app');
  document.body.appendChild(s);
};

initVLibras();

const tema = createTheme({
  palette: {
    primary: { main: "#4a151b" },
    error: { main: "#e11d48" },
    success: { main: "#10b981" },
    warning: { main: "#d97706" },
    info: { main: "#2563eb" },
  },
  typography: { fontFamily: '"Plus Jakarta Sans", sans-serif' },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider theme={tema}>
      <App />
    </ThemeProvider>
  </StrictMode>
);
