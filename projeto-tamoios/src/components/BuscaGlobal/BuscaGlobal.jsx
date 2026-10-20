import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { itensNavegacao } from "../../utils/navegacao.js";
import {
  buscar,
  carregarIndiceBusca,
  normalizar,
} from "../../services/buscaGlobalService.js";
import styles from "../../styles/buscaGlobal.module.css";

const PAGINAS = [
  ...itensNavegacao,
  {
    texto: "Cadastrar desbravador",
    path: "/dashboard/desbravadores/novo",
  },
].map(({ texto, path }) => ({
  grupo: "Páginas",
  chave: `pagina-${path}`,
  titulo: texto,
  detalhe: "Ir para a página",
  caminho: path,
  termos: [normalizar(texto)],
}));

export function BuscaGlobal() {
  const navegar = useNavigate();
  const campo = useRef(null);
  const [termo, setTermo] = useState("");
  const [aberto, setAberto] = useState(false);
  const [indice, setIndice] = useState(null);
  const [ativo, setAtivo] = useState(0);

  useEffect(() => {
    const aoTeclar = (evento) => {
      if (
        (evento.ctrlKey || evento.metaKey) &&
        evento.key.toLowerCase() === "b"
      ) {
        evento.preventDefault();
        campo.current?.focus();
      }
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, []);

  const aoFocar = () => {
    setAberto(true);
    if (!indice) carregarIndiceBusca().then(setIndice);
  };

  const resultados = useMemo(() => {
    if (!normalizar(termo)) return PAGINAS;
    return buscar([...PAGINAS, ...(indice ?? [])], termo);
  }, [termo, indice]);

  const grupos = useMemo(
    () =>
      resultados.reduce((acumulado, item, posicao) => {
        const ultimo = acumulado[acumulado.length - 1];
        const entrada = { ...item, posicao };
        if (ultimo?.nome === item.grupo) ultimo.itens.push(entrada);
        else acumulado.push({ nome: item.grupo, itens: [entrada] });
        return acumulado;
      }, []),
    [resultados]
  );

  const escolher = (item) => {
    navegar(item.caminho, { state: item.estado });
    setTermo("");
    setAberto(false);
    campo.current?.blur();
  };

  const aoTeclarNoCampo = (evento) => {
    if (evento.key === "ArrowDown") {
      evento.preventDefault();
      setAtivo((atual) => Math.min(atual + 1, resultados.length - 1));
    } else if (evento.key === "ArrowUp") {
      evento.preventDefault();
      setAtivo((atual) => Math.max(atual - 1, 0));
    } else if (evento.key === "Enter" && resultados[ativo]) {
      evento.preventDefault();
      escolher(resultados[ativo]);
    } else if (evento.key === "Escape") {
      setAberto(false);
      campo.current?.blur();
    }
  };

  const carregando = normalizar(termo) && !indice;

  return (
    <div
      className={styles.busca}
      onBlur={(evento) => {
        if (!evento.currentTarget.contains(evento.relatedTarget))
          setAberto(false);
      }}
    >
      <SearchIcon className={styles.iconeBusca} fontSize="small" />
      <input
        ref={campo}
        type="search"
        className={styles.campo}
        placeholder="Buscar desbravador, classe, especialidade ou página..."
        value={termo}
        onChange={(evento) => {
          setTermo(evento.target.value);
          setAtivo(0);
          setAberto(true);
        }}
        onFocus={aoFocar}
        onKeyDown={aoTeclarNoCampo}
        role="combobox"
        aria-expanded={aberto}
        aria-controls="resultados-busca-global"
        aria-autocomplete="list"
        aria-label="Busca global"
      />
      <kbd className={styles.atalho}>Ctrl B</kbd>

      {aberto && (
        <div
          className={styles.painel}
          id="resultados-busca-global"
          role="listbox"
        >
          {carregando && <p className={styles.aviso}>Buscando...</p>}

          {!carregando && resultados.length === 0 && (
            <p className={styles.aviso}>
              Nada encontrado para “{termo.trim()}”.
            </p>
          )}

          {grupos.map((grupo) => (
            <div key={grupo.nome} className={styles.grupo}>
              <p className={styles.grupoTitulo}>{grupo.nome}</p>
              {grupo.itens.map((item) => (
                <button
                  key={item.chave}
                  type="button"
                  role="option"
                  aria-selected={item.posicao === ativo}
                  className={`${styles.resultado} ${
                    item.posicao === ativo ? styles.resultadoAtivo : ""
                  }`}
                  onMouseEnter={() => setAtivo(item.posicao)}
                  onClick={() => escolher(item)}
                >
                  <span className={styles.resultadoTextos}>
                    <span className={styles.resultadoTitulo}>
                      {item.titulo}
                      {item.inativo && (
                        <span className={styles.selo}>Desativado</span>
                      )}
                    </span>
                    {item.detalhe && (
                      <span className={styles.resultadoDetalhe}>
                        {item.detalhe}
                      </span>
                    )}
                  </span>
                  <ArrowForwardIcon className={styles.seta} fontSize="small" />
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BuscaGlobal;
