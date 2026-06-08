import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import "@fontsource/fredoka";
import "@fontsource/fredoka/500.css";

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

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
