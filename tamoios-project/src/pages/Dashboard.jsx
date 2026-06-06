import "../App.css";
import Kpi from "../components/Kpi/Kpi";
import { DashboardLayout } from "../layout/DashboardLayout";
import { Card } from "../components/Card/Card.jsx";
import pizzaImg from "../assets/grafico_pizza.png";
import calendarioImg from "../assets/calendario.png";
import { Tabela } from "../components/Tabela/Tabela.jsx";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PersonOffIcon from "@mui/icons-material/PersonOff";

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
        <Kpi icone="pessoa" valor="52" texto="Desbravadores"></Kpi>
        <Kpi icone="livros" valor="34" texto="Especialidades"></Kpi>
        <Kpi icone="chapeuEscola" valor="11" texto="Instrutores"></Kpi>
        <Kpi icone="calendario" valor="02" texto="Feriados (Mês)"></Kpi>
      </div>
      <div
        style={{
          marginTop: "30px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "50%",
          }}
        >
          <img
            src={calendarioImg}
            alt="Imagem do calendário"
            style={{ width: "80%", height: "auto" }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            flexWrap: "wrap",
          }}
        >
          <Card
            titulo="Adicionar Eventos"
            imagemUrl="iconCalendario.png"
            mensagemAlert="Funcionalidade em desenvolvimento"
          ></Card>
          <Card
            titulo="Consultar Especialidade"
            imagemUrl="iconEspecialidade.png"
            mensagemAlert="Funcionalidade em desenvolvimento"
          ></Card>
          <Card
            titulo="Consultar Classes"
            imagemUrl="iconEducacao.png"
            mensagemAlert="Funcionalidade em desenvolvimento"
          ></Card>
          <Card
            titulo="Listar Desbravadores"
            imagemUrl="iconGrupo.png"
            mensagemAlert="Funcionalidade em desenvolvimento"
          ></Card>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          flexWrap: "wrap",
          width: "100%",
          margin: "30px 0",
        }}
      >
        <div
          style={{
            width: "45%",
            backgroundColor: "var(--branco)",
            padding: "20px",
            borderRadius: "8px",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <CalendarMonthIcon></CalendarMonthIcon>
            <h1>02/04/2026</h1>
          </span>
          <Tabela></Tabela>
        </div>
        <div
          style={{
            width: "45%",
            display: "flex",
            alignContent: "center",
            justifyContent: "space-around",
            alignItems: "center",
            backgroundColor: "var(--branco)",
            padding: "20px",
            borderRadius: "8px",
          }}
        >
          <div
            style={{
              width: "60%",
            }}
          >
            <span
              style={{ display: "flex", alignItems: "center", gap: "10px" }}
            >
              <PersonOffIcon></PersonOffIcon>
              <h1>Faltas (este mês)</h1>
            </span>
            <select name="" id="">
              <option value="">Turma A</option>
              <option value="">Turma B</option>
              <option value="">Turma C</option>
            </select>
          </div>
          <img
            src={pizzaImg}
            alt="Grafico Pizza"
            style={{ width: "20%", height: "auto" }}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;
