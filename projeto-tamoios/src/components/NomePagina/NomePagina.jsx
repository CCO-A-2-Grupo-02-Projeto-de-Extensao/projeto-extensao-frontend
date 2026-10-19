import styles from "../../styles/nomePagina.module.css";

export function NomePagina(props) {
  return (
    <div>
      <h1 style={{ fontSize: "32px", lineHeight: "40px", letterSpacing: "-0.02em" }}>{props.titulo}</h1>
      {props.subtitulo ? (
        <h2
          style={{
            fontSize: "16px",
            fontWeight: 400,
            lineHeight: "26px",
            color: "var(--textoSecundario)",
            padding: "6px 0 14px",
          }}
        >
          {props.subtitulo}
        </h2>
      ) : null}
      <hr
        style={{
          height: "1px",
          backgroundColor: "var(--borda)",
          border: "none",
        }}
      />
    </div>
  );
}

export default NomePagina;
