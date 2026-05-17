import styles from "../styles/header.module.css";

export function Header(props) {
  return (
    <header className={styles.header}>
      <div>
        Olá Mundo {props.nome}
        <h2>Sua idade é {props.idade}</h2>;
        <br />
        {props.isAdmin ? "Acesso Autorizado" : "Acesso Negado"};
        <br />
        {/* <ul>
          <li>{hobbies[0]}</li>
          <li>{hobbies[1]}</li>
          <li>{hobbies[2]}</li>
          </ul> */}
      </div>
    </header>
  );
}
