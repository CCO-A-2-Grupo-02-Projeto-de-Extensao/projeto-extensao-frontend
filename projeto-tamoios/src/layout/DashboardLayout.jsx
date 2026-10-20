import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import BarraTopo from "../components/BarraTopo/BarraTopo";
import animacoes from "../styles/animacoes.module.css";

export function DashboardLayout() {
  const { pathname } = useLocation();

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
    </div>
  );
}

export default DashboardLayout;
