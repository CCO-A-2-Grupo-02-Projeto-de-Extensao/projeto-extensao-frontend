import { useEffect, useState } from "react";
import EventIcon from "@mui/icons-material/Event";
import PersonOffIcon from "@mui/icons-material/PersonOff";

import "../App.css";
import { Card } from "../components/Card/Card.jsx";
import { CalendarioAcademico } from "../components/CalendarioAcademico/CalendarioAcademico.jsx";
import Kpi from "../components/Kpi/Kpi.jsx";
import { Select } from "../components/Select/Select.jsx";
import { DashboardLayout } from "../layout/DashboardLayout.jsx";
import { getDadosDashboard } from "../services/dashboardService.js";
import { AdicionarEventoModal } from "../components/AdicionarEventoModal/AdicionarEventoModal.jsx";
import styles from "../styles/dashboard.module.css";

const indicadoresIniciais = {
  desbravadores: "--",
  especialidades: "--",
  instrutores: "--",
  feriados: "--",
};

function paraChaveData(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function Dashboard() {
  const [indicadores, setIndicadores] = useState(indicadoresIniciais);
  const [controleAcademico, setControleAcademico] = useState(null);
  const [dataSelecionada, setDataSelecionada] = useState(() => new Date());
  const [mesExibido, setMesExibido] = useState(() => {
    const hoje = new Date();
    return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  });
  const [categoriaFaltas, setCategoriaFaltas] = useState("todos");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    getDadosDashboard()
      .then((dados) => {
        if (!ativo) return;
        setIndicadores(dados.indicadores);
        setControleAcademico(dados.controleAcademico);
        setCarregando(false);
      })
      .catch(() => {
        if (!ativo) return;
        setErro("Não foi possível carregar os dados do dashboard.");
        setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  const selecionarData = (data) => {
    setDataSelecionada(data);
    setMesExibido(new Date(data.getFullYear(), data.getMonth(), 1));
  };

  const eventosDoDia =
    controleAcademico?.eventos.filter(
      (evento) => evento.data === paraChaveData(dataSelecionada),
    ) ?? [];
  const faltasSelecionadas = controleAcademico?.faltasPorCategoria[
    categoriaFaltas
  ] ?? { faltas: 0, presencas: 0 };
  const totalRegistros =
    faltasSelecionadas.faltas + faltasSelecionadas.presencas;
  const percentualFaltas = totalRegistros
    ? Math.round((faltasSelecionadas.faltas / totalRegistros) * 100)
    : 0;
  const [modalCadastroAberto, setModalCadastroAberto] = useState(false);

  return (
    <DashboardLayout>
      <div className={styles.dashboard}>
        {erro && (
          <p className={styles.mensagemErro} role="alert">
            {erro}
          </p>
        )}

        <section
          className={styles.indicadores}
          aria-label="Indicadores do clube"
        >
          <Kpi
            icone="pessoa"
            valor={indicadores.desbravadores}
            texto="Desbravadores"
          />
          <Kpi
            icone="livros"
            valor={indicadores.especialidades}
            texto="Especialidades"
          />
          <Kpi
            icone="chapeuEscola"
            valor={indicadores.instrutores}
            texto="Instrutores"
          />
          <Kpi
            icone="calendario"
            valor={indicadores.feriados}
            texto="Feriados (Mês)"
          />
        </section>

        <section className={styles.secao} aria-labelledby="titulo-acoes">
          <h2 id="titulo-acoes" className={styles.tituloSecao}>
            Ações Rápidas
          </h2>
          <div className={styles.acoes}>
            {/* TODO: conectar à rota de eventos quando a funcionalidade existir. */}
            <Card
              titulo="Adicionar Eventos"
              imagemUrl="iconCalendario.png"
              mensagemAlert="Funcionalidade em desenvolvimento"
              onClick={() => {
                setModalCadastroAberto(true);
              }}
            />
            <Card
              titulo="Consultar Especialidades"
              imagemUrl="iconEspecialidade.png"
              pagina="/dashboard/especialidades"
            />
            <Card
              titulo="Listar Desbravadores"
              imagemUrl="iconGrupo.png"
              pagina="/dashboard/desbravadores"
            />
            <Card
              titulo="Consultar Classes"
              imagemUrl="iconEducacao.png"
              pagina="/dashboard/classes"
            />
          </div>
        </section>

        <section className={styles.secao} aria-labelledby="titulo-controle">
          <h2 id="titulo-controle" className={styles.tituloSecao}>
            Controle Acadêmico
          </h2>

          {carregando && (
            <p className={styles.mensagemEstado} aria-live="polite">
              Carregando controle acadêmico...
            </p>
          )}

          {!carregando && controleAcademico && (
            <div className={styles.controleAcademico}>
              <div className={styles.painelCalendario}>
                <CalendarioAcademico
                  mesExibido={mesExibido}
                  dataSelecionada={dataSelecionada}
                  onMudarMes={setMesExibido}
                  onSelecionarData={selecionarData}
                />
              </div>

              <article className={styles.painel}>
                <header className={styles.cabecalhoPainel}>
                  <EventIcon
                    className={styles.iconePainel}
                    aria-hidden="true"
                  />
                  <h3 className={styles.dataSelecionada}>
                    {dataSelecionada.toLocaleDateString("pt-BR")}
                  </h3>
                </header>

                {eventosDoDia.length > 0 ? (
                  <table
                    className={styles.tabelaEventos}
                    aria-label="Eventos do dia selecionado"
                  >
                    <thead>
                      <tr>
                        <th>Horário</th>
                        <th>Evento</th>
                      </tr>
                    </thead>
                    <tbody>
                      {eventosDoDia.map((evento) => (
                        <tr key={evento.id}>
                          <td>{evento.horario}</td>
                          <td>{evento.titulo}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className={styles.semEventos}>Nenhum evento nesta data.</p>
                )}
              </article>

              <article className={styles.painel}>
                <header className={styles.cabecalhoPainel}>
                  <PersonOffIcon
                    className={styles.iconePainel}
                    aria-hidden="true"
                  />
                  <h3>Faltas (Este mês)</h3>
                </header>

                <div className={styles.filtroFaltas}>
                  <Select
                    value={categoriaFaltas}
                    onChange={(evento) =>
                      setCategoriaFaltas(evento.target.value)
                    }
                    aria-label="Filtrar faltas por categoria"
                  >
                    <option value="todos">Todos</option>
                    <option value="desbravadores">Desbravadores</option>
                    <option value="instrutores">Instrutores</option>
                  </Select>
                </div>

                <div className={styles.areaGrafico}>
                  <div
                    className={styles.grafico}
                    style={{ "--percentual-faltas": `${percentualFaltas}%` }}
                    role="img"
                    aria-label={`${percentualFaltas}% de faltas no mês: ${faltasSelecionadas.faltas} faltas e ${faltasSelecionadas.presencas} presenças`}
                  >
                    <span className={styles.centroGrafico}>
                      {percentualFaltas}%
                    </span>
                  </div>
                  <div className={styles.legenda} aria-hidden="true">
                    <span className={styles.itemLegenda}>
                      <span className={styles.corLegenda} />
                      {faltasSelecionadas.faltas} faltas
                    </span>
                    <span className={styles.itemLegenda}>
                      <span
                        className={`${styles.corLegenda} ${styles.corPresencas}`}
                      />
                      {faltasSelecionadas.presencas} presenças
                    </span>
                  </div>
                </div>
              </article>
            </div>
          )}
        </section>
        <AdicionarEventoModal
          aberto={modalCadastroAberto}
          onFechar={() => setModalCadastroAberto(false)}
        />
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;
