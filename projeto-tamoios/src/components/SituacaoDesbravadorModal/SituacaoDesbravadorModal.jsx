import { useEffect, useMemo, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { Select } from "../Select/Select.jsx";
import { Input } from "../Input/Input.jsx";
import { Button } from "../Button/Button.jsx";
import { Avatar } from "../Avatar/Avatar.jsx";
import { ConfirmacaoModal } from "../ConfirmacaoModal/ConfirmacaoModal.jsx";
import { useFecharAoClicarFora } from "../../hooks/useFecharAoClicarFora.js";
import { normalizar } from "../../services/buscaGlobalService.js";
import styles from "../../styles/situacaoDesbravadorModal.module.css";

/**
 * Seleção em massa para mudar a situação de desbravadores. Desativar e reativar
 * são a mesma tela: muda o texto, a cor do botão e de onde vem a lista — por
 * isso os dois modais da página de Desbravadores delegam para cá.
 */
const VARIANTES = {
  desativar: {
    titulo: "Desativar desbravadores",
    subtitulo:
      "Quem for desativado sai das listagens ativas. O cadastro e o histórico continuam no sistema.",
    rotulo: "Desativar",
    classeBotao: "botaoDesativar",
    vazio: "Nenhum desbravador ativo encontrado.",
    acao: "desativação",
  },
  reativar: {
    titulo: "Reativar desbravadores",
    subtitulo:
      "O desbravador volta a aparecer nas listagens, nas chamadas e nas classes.",
    rotulo: "Reativar",
    classeBotao: "botaoReativar",
    vazio: "Nenhum desbravador inativo encontrado.",
    acao: "reativação",
  },
};

export function SituacaoDesbravadorModal({
  aberto,
  variante,
  membros,
  onFechar,
  onConfirmar,
}) {
  const textos = VARIANTES[variante];

  const [ordenacao, setOrdenacao] = useState("az");
  const [busca, setBusca] = useState("");
  const [selecionados, setSelecionados] = useState([]);
  const [confirmandoDescarte, setConfirmandoDescarte] = useState(false);

  // Clicar fora preserva a seleção feita; Cancelar é que pergunta antes.
  const fecharAoClicarFora = useFecharAoClicarFora(onFechar);

  useEffect(() => {
    if (!aberto) return undefined;
    const aoTeclar = (evento) => {
      if (evento.key === "Escape") onFechar();
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [aberto, onFechar]);

  const filtrados = useMemo(() => {
    const alvo = normalizar(busca);
    return membros
      .filter((membro) => !alvo || normalizar(membro.nome).includes(alvo))
      .sort((a, b) =>
        ordenacao === "az"
          ? a.nome.localeCompare(b.nome)
          : b.nome.localeCompare(a.nome)
      );
  }, [membros, busca, ordenacao]);

  const estaSelecionado = (membro) =>
    selecionados.some((item) => item.id === membro.id);

  const alternar = (membro) =>
    setSelecionados((atual) =>
      atual.some((item) => item.id === membro.id)
        ? atual.filter((item) => item.id !== membro.id)
        : [...atual, membro]
    );

  const limparEFechar = () => {
    setSelecionados([]);
    setConfirmandoDescarte(false);
    setBusca("");
    onFechar();
  };

  // Só pergunta se há seleção a perder; sem nada marcado, fecha direto.
  const aoCancelar = () => {
    if (selecionados.length === 0) {
      limparEFechar();
      return;
    }
    setConfirmandoDescarte(true);
  };

  const aoConfirmar = () => {
    onConfirmar?.(selecionados);
    setSelecionados([]);
    setBusca("");
    onFechar();
  };

  if (!aberto) return null;

  const total = selecionados.length;

  return (
    <div className={styles.overlay} {...fecharAoClicarFora}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-situacao-desbravador"
      >
        <div className={styles.cabecalho}>
          <div>
            <h2 id="titulo-situacao-desbravador" className={styles.titulo}>
              {textos.titulo}
            </h2>
            <span className={styles.subtitulo}>{textos.subtitulo}</span>
          </div>
          <Button variante="fechar" onClick={onFechar} aria-label="Fechar">
            ×
          </Button>
        </div>

        <div className={styles.corpo}>
          <div className={styles.filtros}>
            <div className={styles.campoOrdenacao}>
              <Select
                value={ordenacao}
                onChange={(evento) => setOrdenacao(evento.target.value)}
                aria-label="Ordenação"
              >
                <option value="az">A-Z</option>
                <option value="za">Z-A</option>
              </Select>
            </div>
            <div className={styles.campoBusca}>
              <Input
                type="search"
                placeholder="Buscar por nome"
                value={busca}
                onChange={(evento) => setBusca(evento.target.value)}
                aria-label="Buscar desbravador por nome"
              />
            </div>
          </div>

          <span className={styles.contagem}>
            {filtrados.length}{" "}
            {filtrados.length === 1 ? "desbravador" : "desbravadores"}
          </span>

          <div className={styles.lista}>
            {filtrados.length === 0 ? (
              <p className={styles.vazio}>{textos.vazio}</p>
            ) : (
              filtrados.map((membro) => (
                <label
                  key={membro.id}
                  className={`${styles.linha} ${
                    estaSelecionado(membro) ? styles.linhaMarcada : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={estaSelecionado(membro)}
                    onChange={() => alternar(membro)}
                  />
                  <Avatar
                    nome={membro.nome}
                    tamanho={32}
                    inativo={variante === "reativar"}
                  />
                  <span className={styles.linhaTextos}>
                    <span className={styles.linhaNome}>{membro.nome}</span>
                    {(membro.papel || membro.unidade) && (
                      <span className={styles.linhaDetalhe}>
                        {[membro.papel, membro.unidade]
                          .filter(Boolean)
                          .join(" • ")}
                      </span>
                    )}
                  </span>
                </label>
              ))
            )}
          </div>
        </div>

        {total > 0 && (
          <div className={styles.selecionados}>
            {selecionados.map((membro) => (
              <span key={membro.id} className={styles.ficha}>
                {membro.nome}
                <button
                  type="button"
                  className={styles.fichaRemover}
                  onClick={() => alternar(membro)}
                  aria-label={`Tirar ${membro.nome} da seleção`}
                >
                  <CloseIcon sx={{ fontSize: 14 }} />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className={styles.rodape}>
          <span className={styles.resumo}>
            {total === 0
              ? "Nenhum selecionado"
              : `${total} ${total === 1 ? "selecionado" : "selecionados"}`}
          </span>

          <div className={styles.botoes}>
            <button
              type="button"
              className={styles.botaoCancelar}
              onClick={aoCancelar}
            >
              Cancelar
            </button>
            <button
              type="button"
              className={styles[textos.classeBotao]}
              onClick={aoConfirmar}
              disabled={total === 0}
            >
              {textos.rotulo}
              {total > 0 ? ` (${total})` : ""}
            </button>
          </div>
        </div>
      </div>

      <ConfirmacaoModal
        aberto={confirmandoDescarte}
        titulo="Descartar seleção?"
        mensagem={
          total === 1
            ? `O desbravador marcado para ${textos.acao} será desmarcado.`
            : `Os ${total} desbravadores marcados para ${textos.acao} serão desmarcados.`
        }
        textoConfirmar="Descartar"
        textoCancelar="Continuar editando"
        perigo
        onConfirmar={limparEFechar}
        onCancelar={() => setConfirmandoDescarte(false)}
      />
    </div>
  );
}

export default SituacaoDesbravadorModal;
