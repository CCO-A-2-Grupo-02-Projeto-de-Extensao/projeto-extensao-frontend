import MedicationIcon from "@mui/icons-material/Medication";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ScheduleIcon from "@mui/icons-material/Schedule";
import EventIcon from "@mui/icons-material/Event";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import AddIcon from "@mui/icons-material/Add";
import { Button } from "../Button/Button.jsx";
import { CartaoDocumento } from "../CartaoDocumento/CartaoDocumento.jsx";
import { DIAS_SEMANA } from "../../services/medicacoesService.js";
import { DOCUMENTO_FICHA_MEDICA } from "../../utils/desbravadorForm.jsx";
import paginaStyles from "../../styles/desbravadorDetalhePage.module.css";
import styles from "../../styles/secaoSaude.module.css";

const formatarData = (valor) => new Date(`${valor}T00:00:00`).toLocaleDateString("pt-BR");

function descreverDias(dias) {
  if (dias.length === DIAS_SEMANA.length) return "Todos os dias";
  return DIAS_SEMANA.filter((dia) => dias.includes(dia.id))
    .map((dia) => dia.rotulo)
    .join(", ");
}

function descreverPeriodo(inicio, fim) {
  if (inicio && fim) return `${formatarData(inicio)} a ${formatarData(fim)}`;
  if (inicio) return `Desde ${formatarData(inicio)} · uso contínuo`;
  if (fim) return `Até ${formatarData(fim)}`;
  return null;
}

function CartaoMedicacao({ medicacao, onEditar, onRemover, onAbrirReceita }) {
  const dose = [medicacao.dose, medicacao.unidadeDose].filter(Boolean).join(" ");
  const periodo = descreverPeriodo(medicacao.inicio, medicacao.fim);
  const nomeReceita = medicacao.receita?.nome ?? medicacao.arquivoReceita?.name;

  return (
    <li className={styles.medicacao}>
      <MedicationIcon className={styles.medicacaoIcone} />

      <div className={styles.medicacaoCorpo}>
        <div className={styles.medicacaoTopo}>
          <span className={styles.medicacaoNome}>{medicacao.nome}</span>
          {dose && <span className={styles.medicacaoDose}>{dose}</span>}
        </div>

        {medicacao.dias.length > 0 && (
          <span className={styles.medicacaoLinha}>
            <CalendarMonthIcon />
            {descreverDias(medicacao.dias)}
          </span>
        )}

        {medicacao.horarios.length > 0 && (
          <span className={styles.medicacaoLinha}>
            <ScheduleIcon />
            {medicacao.horarios.map((horario) => (
              <span key={horario} className={styles.horario}>
                {horario}
              </span>
            ))}
          </span>
        )}

        {periodo && (
          <span className={styles.medicacaoLinha}>
            <EventIcon />
            {periodo}
          </span>
        )}

        {medicacao.observacoes && (
          <span className={styles.observacoes}>{medicacao.observacoes}</span>
        )}

        {nomeReceita ? (
          <button
            type="button"
            className={styles.receita}
            onClick={onAbrirReceita}
            title={`Abrir ${nomeReceita}`}
          >
            <AttachFileIcon fontSize="small" />
            <span>Receita: {nomeReceita}</span>
          </button>
        ) : (
          <span className={styles.semReceita}>Sem receita anexada</span>
        )}
      </div>

      <div className={styles.acoes}>
        <Button
          variante="fechar"
          className={styles.acao}
          onClick={onEditar}
          title="Editar medicação"
          aria-label={`Editar ${medicacao.nome}`}
        >
          <EditIcon />
        </Button>
        <Button
          variante="fechar"
          className={styles.acao}
          onClick={onRemover}
          title="Remover medicação"
          aria-label={`Remover ${medicacao.nome}`}
        >
          <DeleteOutlineIcon />
        </Button>
      </div>
    </li>
  );
}

export function SecaoSaude({
  fichaMedica,
  onAbrirFicha,
  onEnviarFicha,
  onRemoverFicha,
  medicacoes,
  onAdicionarMedicacao,
  onEditarMedicacao,
  onRemoverMedicacao,
  onAbrirReceita,
}) {
  return (
    <section className={paginaStyles.secao}>
      <div className={paginaStyles.secaoCabecalho}>
        <h2 className={paginaStyles.secaoTitulo}>Saúde</h2>
      </div>

      <div className={styles.subsecao}>
        <div className={styles.subsecaoCabecalho}>
          <h3 className={styles.subsecaoTitulo}>Ficha médica</h3>
        </div>
        <ul className={`${paginaStyles.responsaveis} ${styles.fichaGrade}`}>
          <CartaoDocumento
            documento={DOCUMENTO_FICHA_MEDICA}
            arquivo={fichaMedica}
            onAbrir={onAbrirFicha}
            onEnviar={onEnviarFicha}
            onRemover={onRemoverFicha}
          />
        </ul>
      </div>

      <div className={styles.subsecao}>
        <div className={styles.subsecaoCabecalho}>
          <h3 className={styles.subsecaoTitulo}>
            Medicações{medicacoes.length > 0 ? ` (${medicacoes.length})` : ""}
          </h3>
          <Button
            variante="secundario"
            compacto
            className={styles.botaoAdicionar}
            icone={<AddIcon fontSize="small" />}
            texto="Adicionar medicação"
            onClick={onAdicionarMedicacao}
          />
        </div>

        {medicacoes.length === 0 ? (
          <p className={styles.vazio}>Nenhuma medicação cadastrada.</p>
        ) : (
          <ul className={styles.lista}>
            {medicacoes.map((medicacao, indice) => (
              <CartaoMedicacao
                key={medicacao.id ?? indice}
                medicacao={medicacao}
                onEditar={() => onEditarMedicacao(medicacao, indice)}
                onRemover={() => onRemoverMedicacao(medicacao, indice)}
                onAbrirReceita={() => onAbrirReceita(medicacao)}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default SecaoSaude;
