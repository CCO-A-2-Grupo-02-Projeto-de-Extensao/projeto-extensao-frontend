import { useEffect, useMemo, useState } from "react";
import { CircularProgress } from "@mui/material";
import NomePagina from "../components/NomePagina/NomePagina.jsx";
import { DashboardLayout } from "../layout/DashboardLayout.jsx";
import { Input } from "../components/Input/Input.jsx";
import Select from "../components/Select/Select.jsx";
import tabela from "../styles/tabelaBase.module.css";
import styles from "../styles/chamada.module.css";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import SentimentDissatisfiedRoundedIcon from "@mui/icons-material/SentimentDissatisfiedRounded";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import { getMembros } from "../services/membrosService.js";
import {
  buscarChamadaPorData,
  getPresencasPorChamada,
  salvarChamadaCompleta,
  deletarChamadaCompleta,
} from "../services/chamadasService.js";

function paraDataIso(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function paraDataBr(data) {
  const dia = String(data.getDate()).padStart(2, "0");
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const ano = data.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

function formatarMesAno(data) {
  const meses = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];
  return `${meses[data.getMonth()]}, ${data.getFullYear()}`;
}

function mesmaData(dataA, dataB) {
  return (
    dataA.getFullYear() === dataB.getFullYear() &&
    dataA.getMonth() === dataB.getMonth() &&
    dataA.getDate() === dataB.getDate()
  );
}

function montarDiasCalendario(mesExibido) {
  const ano = mesExibido.getFullYear();
  const mes = mesExibido.getMonth();
  const primeiroDia = new Date(ano, mes, 1);
  const inicioGrade = new Date(ano, mes, 1 - primeiroDia.getDay());

  return Array.from({ length: 42 }, (_, indice) => {
    const data = new Date(inicioGrade);
    data.setDate(inicioGrade.getDate() + indice);
    return data;
  });
}

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
  const [dataSelecionada, setDataSelecionada] = useState(() => new Date());
  const [mesExibido, setMesExibido] = useState(() => {
    const hoje = new Date();
    return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  });

  const [rows, setRows] = useState([]);
  const [chamadaAtual, setChamadaAtual] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);

  const [order, setOrder] = useState("alfabetica");
  const [presenceFilter, setPresenceFilter] = useState("todos");
  const [search, setSearch] = useState("");

  const carregarDadosDaData = async (data) => {
    setCarregando(true);
    setErro(null);

    try {
      const dataIso = paraDataIso(data);

      // Carrega membros e chamada em paralelo; trata erros independentemente
      let membros = [];
      let resultadoChamada = null;

      const [membrosResult, chamadaResult] = await Promise.allSettled([
        getMembros(),
        buscarChamadaPorData(dataIso),
      ]);

      if (membrosResult.status === "fulfilled") {
        membros = membrosResult.value;
      } else {
        console.error("Erro ao carregar membros:", membrosResult.reason);
        setErro("Não foi possível carregar a lista de membros.");
        setCarregando(false);
        return;
      }

      if (chamadaResult.status === "fulfilled") {
        resultadoChamada = chamadaResult.value;
      } else {
        console.error("Erro ao buscar chamada:", chamadaResult.reason);
        // Não bloqueia o carregamento — trata como "sem chamada registrada"
        resultadoChamada = null;
      }

      const membrosAtivos = membros.filter((m) => m.ativo !== false);

      if (resultadoChamada?.chamada) {
        const chamada = resultadoChamada.chamada;
        setChamadaAtual(chamada);

        let presencas = [];
        try {
          presencas = await getPresencasPorChamada(chamada.idChamada);
        } catch (err) {
          console.error("Erro ao carregar presenças:", err);
          // Exibe os membros sem presenças — o usuário pode salvar normalmente
        }

        const presencaPorPessoaId = new Map();
        presencas.forEach((p) => {
          presencaPorPessoaId.set(p.idPessoa, p);
        });

        const linhasMapeadas = membrosAtivos.map((membro) => {
          const presencaRegistrada = presencaPorPessoaId.get(membro.id);
          return {
            id: membro.id,
            name: membro.nome,
            role: membro.papel || membro.categoria || "Desbravador",
            present: presencaRegistrada ? presencaRegistrada.presente : true,
            idPresenca: presencaRegistrada ? presencaRegistrada.id : null,
          };
        });

        setRows(linhasMapeadas);
      } else {
        setChamadaAtual(null);
        const linhasMapeadas = membrosAtivos.map((membro) => ({
          id: membro.id,
          name: membro.nome,
          role: membro.papel || membro.categoria || "Desbravador",
          present: true,
          idPresenca: null,
        }));
        setRows(linhasMapeadas);
      }
    } catch (err) {
      console.error("Erro ao carregar dados da chamada:", err);
      setErro("Não foi possível carregar os dados da chamada.");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDadosDaData(dataSelecionada);
  }, [dataSelecionada]);

  const togglePresente = (id) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, present: !row.present } : row
      )
    );
  };

  const handleSalvar = async () => {
    if (salvando || rows.length === 0) return;

    setSalvando(true);
    setErro(null);

    try {
      const dataIso = paraDataIso(dataSelecionada);
      const dataFormatada = paraDataBr(dataSelecionada);
      const titulo = `Chamada - ${dataFormatada}`;

      const { chamada, presencas } = await salvarChamadaCompleta({
        dataIso,
        titulo,
        membrosPresencas: rows,
        chamadaExistente: chamadaAtual,
      });

      setChamadaAtual(chamada);

      // Atualizar os ids de presenca nas linhas locais
      const presencaPorPessoaId = new Map();
      presencas.forEach((p) => {
        presencaPorPessoaId.set(p.idPessoa, p);
      });

      setRows((prev) =>
        prev.map((row) => {
          const presencaSalva = presencaPorPessoaId.get(row.id);
          return {
            ...row,
            idPresenca: presencaSalva ? presencaSalva.id : row.idPresenca,
          };
        })
      );

      alert("Chamada salva com sucesso!");
    } catch (err) {
      console.error("Erro ao salvar chamada:", err);
      alert("Não foi possível salvar a chamada. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  const handleDeletar = async () => {
    if (!chamadaAtual) {
      const confirmarLimpeza = window.confirm(
        "Nenhum registro de chamada salvo no banco para esta data. Deseja redefinir todos como presentes?"
      );
      if (confirmarLimpeza) {
        setRows((prev) => prev.map((row) => ({ ...row, present: true })));
      }
      return;
    }

    const confirmar = window.confirm(
      `Deseja realmente apagar os registros de chamada de ${paraDataBr(
        dataSelecionada
      )}?`
    );

    if (confirmar) {
      setSalvando(true);
      try {
        await deletarChamadaCompleta(chamadaAtual.idChamada);
        setChamadaAtual(null);
        setRows((prev) =>
          prev.map((row) => ({ ...row, present: true, idPresenca: null }))
        );
        alert("Chamada deletada com sucesso!");
      } catch (err) {
        console.error("Erro ao deletar chamada:", err);
        alert("Não foi possível deletar a chamada. Tente novamente.");
      } finally {
        setSalvando(false);
      }
    }
  };

  const handleMudarMes = (incremento) => {
    setMesExibido((prev) => {
      const novo = new Date(prev.getFullYear(), prev.getMonth() + incremento, 1);
      return novo;
    });
  };

  const handleSelecionarData = (data) => {
    setDataSelecionada(data);
    if (data.getMonth() !== mesExibido.getMonth()) {
      setMesExibido(new Date(data.getFullYear(), data.getMonth(), 1));
    }
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

  const diasCalendario = useMemo(
    () => montarDiasCalendario(mesExibido),
    [mesExibido]
  );
  const hoje = useMemo(() => new Date(), []);

  return (
    <DashboardLayout>
      <section className={styles.page}>
        <NomePagina
          titulo={`Chamada - ${paraDataBr(dataSelecionada)}`}
          subtitulo={
            chamadaAtual
              ? "Chamada registrada no sistema"
              : "Nova chamada para a data selecionada"
          }
        />

        <div className={styles.toolbar}>
          <button
            className={styles.toolbarButton}
            type="button"
            onClick={handleSalvar}
            disabled={salvando || carregando}
          >
            <SaveOutlinedIcon className={styles.toolbarButtonIcon} />
            {salvando ? "Salvando..." : "Salvar"}
          </button>
          <button
            className={styles.toolbarButton}
            type="button"
            onClick={handleDeletar}
            disabled={salvando || carregando}
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

        {erro && <div className={styles.mensagemErro}>{erro}</div>}

        <div className={styles.contentGrid}>
          <div className={styles.tableCard}>
            {carregando ? (
              <div className={styles.mensagemEstado}>
                <p>Carregando dados da chamada...</p>
                <CircularProgress
                  size={32}
                  sx={{ color: "var(--vinhoEscuro)", marginTop: "12px" }}
                />
              </div>
            ) : (
              <table className={`${tabela.tabela} ${styles.attendanceTable}`}>
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
                        title="Clique para alternar presença"
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
                      <td
                        colSpan={3}
                        style={{ textAlign: "center", padding: "1.5rem" }}
                      >
                        Nenhum desbravador encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          <aside className={styles.sideColumn}>
            <div className={styles.calendarCard}>
              <div className={styles.calendarHeader}>
                <small>Calendário Acadêmico</small>
                <div className={styles.monthSwitcher}>
                  <button
                    type="button"
                    aria-label="Mês anterior"
                    onClick={() => handleMudarMes(-1)}
                  >
                    <KeyboardDoubleArrowLeftIcon />
                  </button>
                  <strong>{formatarMesAno(mesExibido)}</strong>
                  <button
                    type="button"
                    aria-label="Próximo mês"
                    onClick={() => handleMudarMes(1)}
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

                {diasCalendario.map((data) => {
                  const foraDoMes = data.getMonth() !== mesExibido.getMonth();
                  const isHoje = mesmaData(data, hoje);
                  const isSelecionado = mesmaData(data, dataSelecionada);

                  return (
                    <button
                      key={data.toISOString()}
                      type="button"
                      onClick={() => handleSelecionarData(data)}
                      className={`${styles.dayCell} ${
                        foraDoMes ? styles.dayMuted : ""
                      } ${isHoje ? styles.dayToday : ""} ${
                        isSelecionado ? styles.daySelected : ""
                      }`}
                      aria-label={data.toLocaleDateString("pt-BR")}
                    >
                      {data.getDate()}
                    </button>
                  );
                })}
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
