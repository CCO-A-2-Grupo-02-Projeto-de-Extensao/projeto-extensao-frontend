import "../App.css";
import Kpi from "../components/Kpi/Kpi";
import { DashboardLayout } from "../layout/DashboardLayout";

function Dashboard() {
  return (
    <DashboardLayout>
      <div style={{ display: "flex", gap: "80px" }}>
        <Kpi valor="23" texto="Desbravadores"></Kpi>
        <Kpi valor="23" texto="Desbravadores"></Kpi>
        <Kpi valor="23" texto="Desbravadores"></Kpi>
        <Kpi valor="23" texto="Desbravadores"></Kpi>
      </div>
      <div>
        <div></div>
        <div></div>
      </div>
      <div>
        <div></div>
        <div></div>
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;
