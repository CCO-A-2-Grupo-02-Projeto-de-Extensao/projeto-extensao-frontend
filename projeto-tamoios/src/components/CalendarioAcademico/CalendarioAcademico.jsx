import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import styles from "../../styles/calendarioAcademico.module.css";

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const formatadorMes = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
});

function mesmaData(dataA, dataB) {
  return (
    dataA.getFullYear() === dataB.getFullYear() &&
    dataA.getMonth() === dataB.getMonth() &&
    dataA.getDate() === dataB.getDate()
  );
}

function montarDias(mesExibido) {
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

export function CalendarioAcademico({ mesExibido, dataSelecionada, onMudarMes, onSelecionarData }) {
  const dias = montarDias(mesExibido);
  const hoje = new Date();

  const mudarMes = (incremento) => {
    onMudarMes(
      new Date(
        mesExibido.getFullYear(),
        mesExibido.getMonth() + incremento,
        1
      )
    );
  };

  return (
    <section className={styles.calendario} aria-label="Calendário acadêmico">
      <div className={styles.cabecalho}>
        <button
          type="button"
          className={styles.botaoMes}
          onClick={() => mudarMes(-1)}
          aria-label="Exibir mês anterior"
        >
          <ChevronLeftIcon />
        </button>
        <h3 className={styles.mes}>{formatadorMes.format(mesExibido)}</h3>
        <button
          type="button"
          className={styles.botaoMes}
          onClick={() => mudarMes(1)}
          aria-label="Exibir próximo mês"
        >
          <ChevronRightIcon />
        </button>
      </div>

      <div className={styles.grade} role="grid">
        {DIAS_SEMANA.map((dia) => (
          <span key={dia} className={styles.diaSemana} role="columnheader">
            {dia}
          </span>
        ))}
        {dias.map((data) => {
          const foraDoMes = data.getMonth() !== mesExibido.getMonth();
          const selecionado = mesmaData(data, dataSelecionada);
          const diaAtual = mesmaData(data, hoje);

          return (
            <button
              key={data.toISOString()}
              type="button"
              className={`${styles.dia} ${foraDoMes ? styles.foraDoMes : ""} ${
                selecionado ? styles.selecionado : ""
              } ${diaAtual ? styles.hoje : ""}`}
              onClick={() => onSelecionarData(data)}
              aria-pressed={selecionado}
              aria-label={data.toLocaleDateString("pt-BR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            >
              {data.getDate()}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default CalendarioAcademico;
