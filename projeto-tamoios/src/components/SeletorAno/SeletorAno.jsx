import { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { Button } from "../Button/Button.jsx";
import styles from "../../styles/seletorAno.module.css";

export function SeletorAno({
  anos,
  anoSelecionado,
  onSelecionarAno,
  onAdicionarAno,
  anoMinimo,
  anoMaximo,
}) {
  const [novoAno, setNovoAno] = useState(null);
  const anoValido = Number(novoAno) >= anoMinimo && Number(novoAno) <= anoMaximo;

  const confirmar = () => {
    if (!anoValido) return;
    onAdicionarAno(Number(novoAno));
    setNovoAno(null);
  };

  return (
    <div className={styles.seletorAno}>
      {anos.map(({ ano, classe }) => (
        <button
          key={ano}
          type="button"
          className={`${styles.anoItem} ${
            ano === anoSelecionado ? styles.anoItemAtivo : ""
          }`}
          aria-pressed={ano === anoSelecionado}
          onClick={() => onSelecionarAno(ano)}
        >
          {ano}
          {classe && <span className={styles.anoClasse}>{classe}</span>}
        </button>
      ))}

      {anoMinimo <= anoMaximo &&
        (novoAno === null ? (
          <Button
            variante="icone"
            onClick={() => setNovoAno("")}
            title="Adicionar ano"
            aria-label="Adicionar ano"
          >
            <AddIcon fontSize="small" />
          </Button>
        ) : (
          <div className={styles.novoAno}>
            <input
              type="number"
              className={styles.inputAno}
              min={anoMinimo}
              max={anoMaximo}
              placeholder="Ano"
              title={`De ${anoMinimo} a ${anoMaximo}`}
              aria-label="Ano a adicionar"
              value={novoAno}
              autoFocus
              onChange={(e) => setNovoAno(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmar();
                if (e.key === "Escape") setNovoAno(null);
              }}
            />
            <Button
              variante="icone"
              onClick={confirmar}
              disabled={!anoValido}
              title="Confirmar ano"
              aria-label="Confirmar ano"
            >
              <CheckIcon fontSize="small" />
            </Button>
            <Button
              variante="fechar"
              onClick={() => setNovoAno(null)}
              title="Cancelar"
              aria-label="Cancelar"
            >
              <CloseIcon fontSize="small" />
            </Button>
          </div>
        ))}
    </div>
  );
}

export default SeletorAno;
