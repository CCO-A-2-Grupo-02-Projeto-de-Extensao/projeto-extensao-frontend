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
    <table className={styles.tabela}>
      <thead>
        <tr>
          <th>Horário</th>
          <th>Evento</th>
        </tr>
      </thead>
      <tbody>
        <tr onClick={handleClick}>
          <td>Dia Inteiro</td>
          <td>Páscoa</td>
        </tr>
      </tbody>
    </table>
  );
}
export default Tabela;
