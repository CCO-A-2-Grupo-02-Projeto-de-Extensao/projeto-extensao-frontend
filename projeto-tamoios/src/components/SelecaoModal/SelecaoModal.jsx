import { useMemo, useState } from "react";
import CheckIcon from "@mui/icons-material/Check";

import { Select } from "../Select/Select.jsx";
import { Input } from "../Input/Input.jsx";

import styles from "../../styles/selecaoModal.module.css";

/**
 * Modal de dois painéis usado por todos os fluxos de vínculo da classe:
 * adicionar/remover instrutor, aluno e especialidade. À esquerda a lista
 * filtrável com caixas de seleção, à direita o que foi marcado, e o botão de
 * confirmar devolve os ids escolhidos.
 *
 * `variante` só troca a cor de destaque e o rótulo do botão — "adicionar" é
 * vinho, "remover" é vermelho.
 *
 * O componente só é montado enquanto o modal está aberto, e o pai passa uma
 * `key` diferente por fluxo — é isso que garante estado limpo a cada abertura,
 * sem precisar de um efeito de reset.
 */
export function SelecaoModal({
  titulo,
  tituloSelecionados,
  itens,
  variante = "adicionar",
  rotuloConfirmar,
  filtros,
  filtroAtivo,
  onFiltroChange,
  onFechar,
  onConfirmar,
  carregando = false,
}) {
  const [selecionados, setSelecionados] = useState([]);
  const [ordenacao, setOrdenacao] = useState("az");
  const [busca, setBusca] = useState("");
  const [salvando, setSalvando] = useState(false);

  const itensFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return [...itens]
      .filter((item) => item.nome.toLowerCase().includes(termo))
      .sort((a, b) =>
        ordenacao === "az"
          ? a.nome.localeCompare(b.nome)
          : b.nome.localeCompare(a.nome)
      );
  }, [itens, busca, ordenacao]);

  const itensSelecionados = useMemo(
    () => itens.filter((item) => selecionados.includes(item.id)),
    [itens, selecionados]
  );

  const alternar = (id) => {
    setSelecionados((atual) =>
      atual.includes(id)
        ? atual.filter((item) => item !== id)
        : [...atual, id]
    );
  };

  const confirmar = async () => {
    if (selecionados.length === 0) {
      return;
    }

    setSalvando(true);

    try {
      await onConfirmar(selecionados);
    } finally {
      setSalvando(false);
    }
  };

  const ehRemocao = variante === "remover";

  return (
    <div className={styles.overlay} onMouseDown={onFechar}>
      <div
        className={`${styles.modal} ${ehRemocao ? styles.modalRemover : ""}`}
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={titulo}
      >
        <section className={styles.painelLista}>
          <h2 className={styles.titulo}>{titulo}</h2>

          <div className={styles.filtros}>
            <div className={styles.campoOrdenacao}>
              <Select
                value={ordenacao}
                onChange={(e) => setOrdenacao(e.target.value)}
                aria-label="Ordenação"
              >
                <option value="az">A-Z</option>
                <option value="za">Z-A</option>
              </Select>
            </div>

            {filtros && filtros.length > 0 && (
              <div className={styles.campoFiltro}>
                <Select
                  value={filtroAtivo}
                  onChange={(e) => onFiltroChange(e.target.value)}
                  aria-label="Filtro"
                >
                  {filtros.map((filtro) => (
                    <option key={filtro.valor} value={filtro.valor}>
                      {filtro.rotulo}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            <div className={styles.campoBusca}>
              <Input
                type="search"
                placeholder="Buscar"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                aria-label="Buscar na lista"
              />
            </div>
          </div>

          <div className={styles.lista}>
            {carregando && <p className={styles.vazio}>Carregando...</p>}

            {!carregando && itensFiltrados.length === 0 && (
              <p className={styles.vazio}>Nenhum resultado.</p>
            )}

            {!carregando &&
              itensFiltrados.map((item) => (
                <label key={item.id} className={styles.linha}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={selecionados.includes(item.id)}
                    onChange={() => alternar(item.id)}
                  />

                  <span className={styles.linhaNome}>{item.nome}</span>

                  {item.detalhe && (
                    <span className={styles.linhaDetalhe}>{item.detalhe}</span>
                  )}
                </label>
              ))}
          </div>
        </section>

        <aside className={styles.painelSelecionados}>
          <button
            type="button"
            className={styles.fechar}
            onClick={onFechar}
            aria-label="Fechar"
          >
            ×
          </button>

          <h3 className={styles.tituloSelecionados}>{tituloSelecionados}</h3>

          <div
            className={`${styles.caixaSelecionados} ${
              ehRemocao ? styles.caixaRemover : ""
            }`}
          >
            {itensSelecionados.map((item) => (
              <div key={item.id} className={styles.selecionado}>
                <span className={styles.marca} aria-hidden="true">
                  <CheckIcon sx={{ fontSize: 13 }} />
                </span>
                {item.nome}
              </div>
            ))}
          </div>

          <div className={styles.botoes}>
            <button
              type="button"
              className={styles.botaoCancelar}
              onClick={onFechar}
            >
              Cancelar
            </button>

            <button
              type="button"
              className={`${styles.botaoConfirmar} ${
                ehRemocao ? styles.botaoRemover : ""
              }`}
              onClick={confirmar}
              disabled={selecionados.length === 0 || salvando}
            >
              {salvando
                ? "Salvando..."
                : rotuloConfirmar ?? (ehRemocao ? "Remover" : "Adicionar")}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default SelecaoModal;
