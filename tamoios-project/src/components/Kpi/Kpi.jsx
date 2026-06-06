import styles from "../../styles/kpi.module.css";
import PersonIcon from "@mui/icons-material/Person";
import CollectionsBookmarkIcon from "@mui/icons-material/CollectionsBookmark";
import SchoolIcon from "@mui/icons-material/School";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

const iconMap = {
  pessoa: PersonIcon,
  livros: CollectionsBookmarkIcon,
  chapeuEscola: SchoolIcon,
  calendario: CalendarMonthIcon,
};

export function Kpi(props) {
  const IconComponent = iconMap[props.icone];
  return (
    <div className={styles.box_kpi}>
      <div className={styles.box_kpi__img}>
        <IconComponent className={styles.customIcon} />
      </div>
      <div className={styles.box_kpi__dados}>
        <h1>{props.valor}</h1>
        <h1>{props.texto}</h1>
      </div>
    </div>
  );
}

export default Kpi;
