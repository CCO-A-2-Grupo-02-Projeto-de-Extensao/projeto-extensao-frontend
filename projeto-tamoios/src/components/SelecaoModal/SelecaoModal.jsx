import { useMemo, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";

import { Select } from "../Select/Select.jsx";
import { Input } from "../Input/Input.jsx";
import { Button } from "../Button/Button.jsx";
import { useFecharAoClicarFora } from "../../hooks/useFecharAoClicarFora.js";
import { normalizar } from "../../services/buscaGlobalService.js";

import casca from "../../styles/cascaModal.module.css";
import styles from "../../styles/selecaoModal.module.css";

export function SelecaoModal({
  titulo,
  subtitulo,
  itens,
  variante = "adicionar",
  rotuloConfirmar,
  onFechar,
  onConfirmar,
  carregando = false,
}) {
  const [selecionados, setSelecionados] = useState([]);
  const [ordenacao, setOrdenacao] = useState("az");
  const [busca, setBusca] = useState("");
  const [salvando, setSalvando] = useState(false);

  const fecharAoClicarFora = useFecharAoClicarFora(onFechar);

  const itensFiltrados = useMemo(() => {
    const alvo = normalizar(busca);

    return itens
      .filter((item) => !alvo || normalizar(item.nome).includes(alvo))
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
    if (selecionados.length === 0) return;

    setSalvando(true);
    try {
      await onConfirmar(selecionados);
    } finally {
      setSalvando(false);
    }
  };

  const ehRemocao = variante === "remover";
  const total = selecionados.length;
  const rotulo = rotuloConfirmar ?? (ehRemocao ? "Remover" : "Adicionar");

  return (
    <div className={casca.overlay} {...fecharAoClicarFora}>
      <div
        className={`${casca.modal} ${styles.modal}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-selecao"
      >
        <div className={casca.cabecalho}>
          <div>
            <h2 id="titulo-selecao" className={casca.titulo}>
              {titulo}
            </h2>
            {subtitulo && <span className={casca.subtitulo}>{subtitulo}</span>}
          </div>
          <Button variante="fechar" onClick={onFechar} aria-label="Fechar">
            <CloseIcon />
          </Button>
        </div>

        <div className={casca.corpo}>
          <div className={casca.filtros}>
            <div className={casca.campoOrdenacao}>
              <Select
                value={ordenacao}
                onChange={(e) => setOrdenacao(e.target.value)}
                aria-label="Ordenação"
              >
                <option value="az">A-Z</option>
                <option value="za">Z-A</option>
              </Select>
            </div>
            <div className={casca.campoBusca}>
              <Input
                type="search"
                placeholder="Buscar por nome"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                aria-label="Buscar na lista"
              />
            </div>
          </div>

          <span className={casca.contagem}>
            {itensFiltrados.length}{" "}
            {itensFiltrados.length === 1 ? "resultado" : "resultados"}
          </span>

          <div className={casca.lista}>
            {carregando && <p className={casca.vazio}>Carregando...</p>}

            {!carregando && itensFiltrados.length === 0 && (
              <p className={casca.vazio}>Nenhum resultado.</p>
            )}

            {!carregando &&
              itensFiltrados.map((item) => (
                <label
                  key={item.id}
                  className={`${casca.linha} ${styles.linha} ${
                    selecionados.includes(item.id) ? styles.linhaMarcada : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={selecionados.includes(item.id)}
                    onChange={() => alternar(item.id)}
                  />
                  <span className={casca.linhaTextos}>
                    <span className={casca.linhaNome}>{item.nome}</span>
                    {item.detalhe && (
                      <span className={casca.linhaDetalhe}>{item.detalhe}</span>
                    )}
                  </span>
                </label>
              ))}
          </div>
        </div>

        {total > 0 && (
          <div className={styles.selecionados}>
            {itensSelecionados.map((item) => (
              <span key={item.id} className={styles.ficha}>
                {item.nome}
                <button
                  type="button"
                  className={styles.fichaRemover}
                  onClick={() => alternar(item.id)}
                  aria-label={`Tirar ${item.nome} da seleção`}
                >
                  <CloseIcon sx={{ fontSize: 14 }} />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className={casca.rodape}>
          <span className={casca.resumo}>
            {total === 0
              ? "Nenhum selecionado"
              : `${total} ${total === 1 ? "selecionado" : "selecionados"}`}
          </span>

          <div className={casca.botoes}>
            <Button variante="secundario" onClick={onFechar} texto="Cancelar" />
            <Button
              variante={ehRemocao ? "perigo" : "primario"}
              onClick={confirmar}
              disabled={total === 0 || salvando}
              texto={
                salvando
                  ? "Salvando..."
                  : `${rotulo}${total > 0 ? ` (${total})` : ""}`
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SelecaoModal;
