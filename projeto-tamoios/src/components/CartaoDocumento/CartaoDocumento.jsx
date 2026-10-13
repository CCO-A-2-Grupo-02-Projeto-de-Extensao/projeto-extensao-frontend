import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AddIcon from "@mui/icons-material/Add";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import DescriptionIcon from "@mui/icons-material/Description";
import BadgeIcon from "@mui/icons-material/Badge";
import VaccinesIcon from "@mui/icons-material/Vaccines";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import PlaceIcon from "@mui/icons-material/Place";
import MedicalInformationIcon from "@mui/icons-material/MedicalInformation";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import SchoolIcon from "@mui/icons-material/School";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import styles from "../../styles/desbravadorDetalhePage.module.css";

// Um ícone por tipo de documento, para que o cartão seja reconhecível antes
// mesmo de ler o título. Os ids são os de DOCUMENTOS (desbravadorForm.jsx).
const ICONES_DOCUMENTO = {
  certidaoNascimento: DescriptionIcon,
  cartaoSus: BadgeIcon,
  carteiraVacinacao: VaccinesIcon,
  carteiraConvenio: LocalHospitalIcon,
  comprovanteEndereco: PlaceIcon,
  fichaMedica: MedicalInformationIcon,
  autorizacaoClube: AssignmentTurnedInIcon,
  boletimEscolar: SchoolIcon,
  declaracaoPais: FamilyRestroomIcon,
};

export function CartaoDocumento({ documento, arquivo, onAbrir, onEnviar, onRemover }) {
  const Icone = ICONES_DOCUMENTO[documento.id] ?? DescriptionIcon;
  const enviado = Boolean(arquivo);

  return (
    <li className={`${styles.documento} ${enviado ? styles.documentoEnviado : ""}`}>
      {/* O cartão inteiro é a ação principal: abre o arquivo quando já existe,
          abre o upload quando ainda falta. */}
      <button
        type="button"
        className={styles.documentoBotao}
        onClick={enviado ? onAbrir : onEnviar}
        title={enviado ? `Abrir ${arquivo.nome}` : `Anexar ${documento.titulo}`}
      >
        <span className={styles.documentoSelo} aria-hidden="true">
          {enviado ? (
            <CheckCircleIcon className={styles.documentoSeloOk} />
          ) : (
            <AddIcon className={styles.documentoSeloPendente} />
          )}
        </span>

        <Icone className={styles.documentoIcone} />

        <span className={styles.documentoTitulo}>{documento.titulo}</span>

        <span
          className={enviado ? styles.documentoStatusOk : styles.documentoStatusPendente}
        >
          {enviado ? arquivo.nome : "Pendente"}
        </span>
      </button>

      {enviado && (
        <div className={styles.documentoAcoes}>
          <button
            type="button"
            className={styles.documentoAcao}
            onClick={onEnviar}
            title="Substituir arquivo"
            aria-label={`Substituir ${documento.titulo}`}
          >
            <SwapHorizIcon fontSize="small" />
          </button>
          <button
            type="button"
            className={styles.documentoAcaoRemover}
            onClick={onRemover}
            title="Remover arquivo"
            aria-label={`Remover ${documento.titulo}`}
          >
            <DeleteOutlineIcon fontSize="small" />
          </button>
        </div>
      )}
    </li>
  );
}

export default CartaoDocumento;
