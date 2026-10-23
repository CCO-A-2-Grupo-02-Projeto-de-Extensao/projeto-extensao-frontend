import styles from "../../styles/escolhaEscopo.module.css";

const OPCOES = [
  { valor: "ESTE", rotulo: "Só este evento" },
  { valor: "SEGUINTES", rotulo: "Este e os seguintes" },
  { valor: "TODOS", rotulo: "Todos os eventos da série" },
];

export function EscolhaEscopo({ legenda, valor, onChange, semEste = false }) {
  return (
    <fieldset className={styles.grupo}>
      <legend className={styles.legenda}>{legenda}</legend>
      {OPCOES.filter((opcao) => !semEste || opcao.valor !== "ESTE").map(
        ({ valor: opcao, rotulo }) => (
          <label key={opcao} className={styles.opcao}>
            <input
              type="radio"
              name="escopo-evento"
              value={opcao}
              checked={valor === opcao}
              onChange={() => onChange(opcao)}
            />
            {rotulo}
          </label>
        )
      )}
    </fieldset>
  );
}

export default EscolhaEscopo;
