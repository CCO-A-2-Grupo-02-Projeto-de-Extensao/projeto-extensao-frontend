import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

const ROTAS_PUBLICAS = ["/usuarios/login", "/auth"];

api.interceptors.request.use((config) => {
  const url = config.url ?? "";
  const rotaPublica = ROTAS_PUBLICAS.some((rota) => url.includes(rota));
  const token = localStorage.getItem("token");

  if (token && !rotaPublica) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Token expirado ou inválido derruba a sessão e volta para o login. Sem isto o
// ProtectedRoute deixa passar — ele só verifica se o token existe, não se vale —
// e a tela abre vazia, sem erro.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url ?? "";
    const rotaPublica = ROTAS_PUBLICAS.some((rota) => url.includes(rota));

    if (error.response?.status === 401 && !rotaPublica) {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");

      // replace em vez de href: não deixa o botão voltar cair na tela quebrada.
      if (window.location.pathname !== "/") {
        window.location.replace("/");
      }
    }

    return Promise.reject(error);
  }
);

export default api;
