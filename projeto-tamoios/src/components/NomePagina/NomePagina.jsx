import styles from "../../styles/nomePagina.module.css";

export function NomePagina(props) {
  return (
    <div>
      <h1 style={{ fontSize: "48px" }}>{props.titulo}</h1>
      {props.subtitulo ? (
        <h2 style={{ fontSize: "24px", padding: "14px 0" }}>
          {props.subtitulo}
        </h2>
      ) : null}
      <hr
        style={{
          height: "2px",
          backgroundColor: "black",
          border: "none",
          borderRadius: "2px",
        }}
      />
    </div>
  );
}

export default NomePagina;
