import { useMemo, useState } from "react";
import NomePagina from "../components/NomePagina/NomePagina.jsx";
import { DashboardLayout } from "../layout/DashboardLayout.jsx";
import { Input } from "../components/Input/Input.jsx";
import Select from "../components/Select/Select.jsx";
import styles from "../styles/chamada.module.css";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import SentimentDissatisfiedRoundedIcon from "@mui/icons-material/SentimentDissatisfiedRounded";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

// Mockado por enquanto, precisa atualizar com os dados do banco
const initialRows = Array.from({ length: 15 }, (_, index) => ({
  id: index,
  name: "Ademar Teste",
  role: index === 0 ? "Instrutor" : "Aluno",
  present: true,
}));

const calendarWeeks = [
  [29, 30, 31, 1, 2, 3, 4],
  [5, 6, 7, 8, 9, 10, 11],
  [12, 13, 14, 15, 16, 17, 18],
  [19, 20, 21, 22, 23, 24, 25],
  [26, 27, 28, 29, 30, 1, 2],
];

const MENSAGEM_EM_DESENVOLVIMENTO = "Funcionalidade em desenvolvimento";

function StatCard({ icon: Icon, value, label }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statIconWrap}>
        <Icon className={styles.statIcon} />
      </div>
      <div className={styles.statText}>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}

export function ChamadaPage() {
  const [rows, setRows] = useState(initialRows);
  const [order, setOrder] = useState("alfabetica");
  const [presenceFilter, setPresenceFilter] = useState("todos");
  const [search, setSearch] = useState("");

  const togglePresente = (id) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, present: !row.present } : row))
    );
  };

  const handleSalvar = () => {
    alert("Chamada salva com sucesso!");
  };

  const handleDeletar = () => {
    const confirmar = window.confirm(
      "Deseja realmente apagar os registros de chamada de hoje?"
    );
    if (confirmar) {
      setRows(initialRows.map((row) => ({ ...row, present: true })));
      alert("Chamada deletada!");
    }
  };

  const handleMudarMes = () => {
    alert(MENSAGEM_EM_DESENVOLVIMENTO);
  };

  const visibleRows = useMemo(() => {
    let result = rows.filter((row) =>
      row.name.toLowerCase().includes(search.trim().toLowerCase())
    );

    if (presenceFilter === "presentes") {
      result = result.filter((row) => row.present);
    } else if (presenceFilter === "faltantes") {
      result = result.filter((row) => !row.present);
    }

    result = [...result].sort((a, b) =>
      order === "alfabetica"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    );

    return result;
  }, [rows, order, presenceFilter, search]);

  const stats = useMemo(() => {
    const total = rows.length;
    const presentes = rows.filter((row) => row.present).length;
    return [
      {
        icon: GroupRoundedIcon,
        value: String(total),
        label: "Desbravadores totais",
      },
      {
        icon: CheckCircleRoundedIcon,
        value: String(presentes),
        label: "Presentes hoje",
      },
      {
        icon: SentimentDissatisfiedRoundedIcon,
        value: String(total - presentes),
        label: "Faltantes hoje",
      },
    ];
  }, [rows]);

  return (
    <DashboardLayout>
      <section className={styles.page}>
        <NomePagina titulo="Chamada - 05/04/2026" subtitulo="" />

        <div className={styles.toolbar}>
          <button
            className={styles.toolbarButton}
            type="button"
            onClick={handleSalvar}
          >
            <SaveOutlinedIcon className={styles.toolbarButtonIcon} />
            Salvar
          </button>
          <button
            className={styles.toolbarButton}
            type="button"
            onClick={handleDeletar}
          >
            <DeleteOutlineOutlinedIcon className={styles.toolbarButtonIcon} />
            Deletar
          </button>
        </div>

        <div className={styles.filtersRow}>
          <div className={styles.filterSelectWrap}>
            <Select
              defaultValue="alfabetica"
              style={{ margin: 0 }}
              onChange={(event) => setOrder(event.target.value)}
            >
              <option value="alfabetica">Ordem alfabética (normal)</option>
              <option value="reversa">Ordem alfabética (reversa)</option>
            </Select>
          </div>

          <div className={styles.filterSelectWrapSmall}>
            <Select
              defaultValue="todos"
              style={{ margin: 0 }}
              onChange={(event) => setPresenceFilter(event.target.value)}
            >
              <option value="todos">Todos</option>
              <option value="presentes">Presentes</option>
              <option value="faltantes">Faltantes</option>
            </Select>
          </div>

          <div className={styles.searchWrap}>
            <Input
              placeholder="Buscar"
              style={{ margin: 0 }}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        <div className={styles.contentGrid}>
          <div className={styles.tableCard}>
            <table className={styles.attendanceTable}>
              <thead>
                <tr>
                  <th>Nome/Sobrenome</th>
                  <th>Papéis</th>
                  <th>Presente</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.name}</td>
                    <td>{row.role}</td>
                    <td
                      className={styles.presentCell}
                      onClick={() => togglePresente(row.id)}
                      role="button"
                      tabIndex={0}
                      style={{ cursor: "pointer" }}
                    >
                      {row.present ? (
                        <CheckCircleIcon className={styles.presentIcon} />
                      ) : (
                        <span className={styles.absentMark}>-</span>
                      )}
                    </td>
                  </tr>
                ))}
                {visibleRows.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ textAlign: "center", padding: "1rem" }}>
                      Nenhum desbravador encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <aside className={styles.sideColumn}>
            <div className={styles.calendarCard}>
              <div className={styles.calendarHeader}>
                <small>Calendário Acadêmico</small>
                <div className={styles.monthSwitcher}>
                  <button
                    type="button"
                    aria-label="Mês anterior"
                    onClick={handleMudarMes}
                  >
                    <KeyboardDoubleArrowLeftIcon />
                  </button>
                  <strong>Abril, 2026</strong>
                  <button
                    type="button"
                    aria-label="Próximo mês"
                    onClick={handleMudarMes}
                  >
                    <KeyboardDoubleArrowRightIcon />
                  </button>
                </div>
              </div>

              <div className={styles.calendarGrid}>
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                  <span key={day} className={styles.weekdayCell}>
                    {day}
                  </span>
                ))}

                {calendarWeeks.flatMap((week, weekIndex) =>
                  week.map((day, dayIndex) => {
                    const isToday = weekIndex === 0 && day === 2;
                    const isMuted =
                      (weekIndex === 0 && day >= 29 && day <= 31) ||
                      (weekIndex === 4 && day >= 1 && day <= 2);

                    return (
                      <span
                        key={`${weekIndex}-${dayIndex}-${day}`}
                        className={`${styles.dayCell} ${
                          isMuted ? styles.dayMuted : ""
                        } ${isToday ? styles.dayToday : ""}`}
                      >
                        {day}
                      </span>
                    );
                  })
                )}
              </div>
            </div>

            <div className={styles.statsStack}>
              {stats.map((stat) => (
                <StatCard key={stat.label} {...stat} />
              ))}
            </div>
          </aside>
        </div>
      </section>
    </DashboardLayout>
  );
}

export default ChamadaPage;
