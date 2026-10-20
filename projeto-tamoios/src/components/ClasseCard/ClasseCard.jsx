import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Avatar } from "../Avatar/Avatar.jsx";
import { imagemDaClasse } from "../../utils/classeImagens.js";
import { visualDaClasse } from "../../utils/classesVisual.js";
import styles from "../../styles/classeCard.module.css";

const MAX_AVATARES = 3;

// participantes: desbravadores a pré-exibir (null = não foi possível carregar).
// total: quantidade total de inscritos na classe (null = desconhecido).
// buscando: quando há busca ativa, `participantes` traz só quem bateu com ela.
export function ClasseCard({
  classe,
  participantes = null,
  total = null,
  buscando = false,
  indice = 0,
  onAbrir,
}) {
  const visual = visualDaClasse(classe.nome);
  // A placa da classe (SVG) continua sendo a imagem do card.
  const imagem = imagemDaClasse(classe.nome);

  const visiveis = (participantes ?? []).slice(0, MAX_AVATARES);
  const restantes = Math.max(0, (participantes ?? []).length - visiveis.length);

  let rotuloContagem = null;
  if (total !== null) {
    if (buscando) {
      const n = (participantes ?? []).length;
      rotuloContagem = `${n} ${n === 1 ? "encontrado" : "encontrados"}`;
    } else if (total === 0) {
      rotuloContagem = "Nenhum desbravador";
    } else {
      rotuloContagem = `${total} ${total === 1 ? "desbravador" : "desbravadores"}`;
    }
  }

  return (
    <article
      className={styles.card}
      style={{ "--cor-classe": visual.cor, "--i": Math.min(indice, 8) }}
    >
      <div className={styles.placa}>
        {imagem ? (
          <img src={imagem} alt={`Placa da classe ${classe.nome}`} />
        ) : (
          <span className={styles.semPlaca}>{classe.nome}</span>
        )}
      </div>

      <div className={styles.corpo}>
        <div className={styles.topo}>
          <div className={styles.titulos}>
            <span className={styles.sobretitulo}>
              <span className={styles.ponto} aria-hidden="true" />
              {visual.idade ? `${visual.idade} anos • Regular` : "Regular"}
            </span>
            <h2 className={styles.nome}>{classe.nome}</h2>
            {visual.subtitulo && (
              <p className={styles.subtitulo}>{visual.subtitulo}</p>
            )}
          </div>

          {rotuloContagem && (
            <span className={styles.badge}>{rotuloContagem}</span>
          )}
        </div>

        <div className={styles.rodape}>
          <div className={styles.participantes}>
            {visiveis.length > 0 && (
              <ul className={styles.avatares}>
                {visiveis.map((pessoa) => (
                  <li key={pessoa.id} className={styles.avatar} title={pessoa.nome}>
                    <Avatar nome={pessoa.nome} tamanho={32} />
                  </li>
                ))}
                {restantes > 0 && <li className={styles.mais}>+{restantes}</li>}
              </ul>
            )}
          </div>

          {/* O ::after do botão cobre o card inteiro, então o card todo é
              clicável sem aninhar botões nem duplicar o foco do teclado. */}
          <button
            type="button"
            className={styles.botaoAcessar}
            onClick={() => onAbrir(classe)}
            aria-label={`Acessar turma da classe ${classe.nome}`}
          >
            Acessar Turma
            <ArrowForwardIcon fontSize="small" className={styles.seta} />
          </button>
        </div>
      </div>
    </article>
  );
}

export default ClasseCard;
