import "../App.css";
import Kpi from "../components/Kpi/Kpi";
import { DashboardLayout } from "../layout/DashboardLayout";
import { Button } from "../components/Button/Button.jsx";
import pizzaImg from "../assets/grafico_pizza.png";

function Dashboard() {
  return (
    <DashboardLayout>
      <div
        style={{
          display: "flex",
          gap: "30px",
          alignItems: "center",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <Kpi valor="52" texto="Desbravadores"></Kpi>
        <Kpi valor="34" texto="Especialidades"></Kpi>
        <Kpi valor="11" texto="Instrutores"></Kpi>
        <Kpi valor="02" texto="Feriados (Mês)"></Kpi>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          flexWrap: "wrap",
        }}
      >
        <div>
          <input type="date" />
        </div>
        <div>
          <Button texto={"Entrar"} pagina={"dashboard"}></Button>
          <Button texto={"Entrar"} pagina={"dashboard"}></Button>
          <Button texto={"Entrar"} pagina={"dashboard"}></Button>
          <Button texto={"Entrar"} pagina={"dashboard"}></Button>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1>02/04/2026</h1>
          <table>
            <thead>
              <tr>
                <th>Horário</th>
                <th>Evento</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Dia Inteiro</td>
                <td>Páscoa</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div>
          <h1>Faltas (Este mês)</h1>
          <select name="" id="">
            <option value="">Turma A</option>
            <option value="">Turma B</option>
            <option value="">Turma C</option>
          </select>
          <img src={pizzaImg} alt="" />
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;
