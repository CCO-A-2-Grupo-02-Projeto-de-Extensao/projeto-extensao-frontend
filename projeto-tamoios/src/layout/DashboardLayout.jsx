import Sidebar from "../components/Sidebar/Sidebar";
import BarraTopo from "../components/BarraTopo/BarraTopo";
import animacoes from "../styles/animacoes.module.css";

export function DashboardLayout({ children }) {
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
        <div className={animacoes.pagina} style={{ padding: "32px" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
