import { useNavigate } from "react-router-dom";

export function useVoltar(alternativa) {
  const navegar = useNavigate();

  return () => {
    if (window.history.state?.idx > 0) {
      navegar(-1);
    } else {
      navegar(alternativa, { replace: true });
    }
  };
}
