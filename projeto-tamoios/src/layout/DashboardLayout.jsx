import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import BarraTopo from "../components/BarraTopo/BarraTopo";
import { Cortina } from "../components/Cortina/Cortina.jsx";
import { prefereMenosMovimento } from "../utils/movimento.js";
import animacoes from "../styles/animacoes.module.css";

export function DashboardLayout() {
  const { pathname, state } = useLocation();
  const navigate = useNavigate();
  const entrando = state?.entrada && !prefereMenosMovimento();

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <main
        style={{
          flexGrow: 1,
          minWidth: 0,
          marginLeft: "240px",
          backgroundColor: "var(--cremeClaro)",
          minHeight: "100vh",
        }}
      >
        <BarraTopo />
        <div
          key={pathname}
          className={animacoes.pagina}
          style={{ padding: "32px" }}
        >
          <Outlet />
        </div>
      </main>
      {entrando && (
        <Cortina
          variante="recolher"
          onFim={() => navigate(pathname, { replace: true })}
        />
      )}
    </div>
  );
}

export default DashboardLayout;
