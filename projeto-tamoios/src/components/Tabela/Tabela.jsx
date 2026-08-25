import tabela from "../../styles/tabelaBase.module.css";
import styles from "../../styles/tabela.module.css";
import { useNavigate } from "react-router-dom";

export function Tabela(props) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (props.pagina === undefined) {
      alert(props.mensagemAlert);
    } else {
      navigate(props.pagina);
    }
  };

  return (
    <table className={tabela.tabela}>
      <thead>
        <tr>
          <th>Horário</th>
          <th>Evento</th>
        </tr>
      </thead>
      <tbody>
        <tr onClick={handleClick} className={tabela.linhaClicavel}>
          <td className={styles.horario}>Dia Inteiro</td>
          <td>Páscoa</td>
        </tr>
      </tbody>
    </table>
  );
}
export default Tabela;
