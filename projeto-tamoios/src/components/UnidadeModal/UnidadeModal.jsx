import { useCallback, useEffect, useMemo, useState } from "react";
import CheckIcon from "@mui/icons-material/Check";

import { Select } from "../Select/Select.jsx";
import { Input } from "../Input/Input.jsx";

import {
  atualizarUnidade,
  criarUnidadeNaClasse,
  definirUnidadeDasPessoas,
  getParticipantesDaClasse,
} from "../../services/classesService.js";
import { getGeneros } from "../../services/catalogosService.js";

import styles from "../../styles/unidadeModal.module.css";

const FORM_VAZIO = {
  nome: "",
  idGenero: "",
  faixaEtaria: "",
  idConselheiro: "",
};

function formularioDaUnidade(unidade) {
  if (!unidade) return FORM_VAZIO;

  return {
    nome: unidade.nome ?? "",
    idGenero: unidade.idGenero ? String(unidade.idGenero) : "",
    faixaEtaria: unidade.faixaEtaria ?? "",
    idConselheiro: unidade.idConselheiro ? String(unidade.idConselheiro) : "",
  };
}

/**
 * Criar e editar unidade compartilham o mesmo modal, como nos dois mockups: à
 * esquerda a lista de desbravadores da classe, à direita o formulário e os
 * selecionados. Em "criar", os marcados entram na unidade nova; em "editar",
 * podem ser adicionados ou removidos dela.
 *
 * Montado só enquanto aberto (o pai controla), então o estado inicial do
 * useState já basta — não há efeito de reset.
 */
export function UnidadeModal({
  modo,
  idClasse,
  nomeClasse,
  unidadesDaClasse = [],
  onFechar,
  onSalvo,
}) {
  const edicao = modo === "editar";
  const unidadeInicial = edicao ? unidadesDaClasse[0] : null;

  const [formulario, setFormulario] = useState(() =>
    formularioDaUnidade(unidadeInicial)
  );
  const [idUnidadeSelecionada, setIdUnidadeSelecionada] = useState(
    unidadeInicial ? String(unidadeInicial.id) : ""
  );
  const [participantes, setParticipantes] = useState([]);
  const [generos, setGeneros] = useState([]);
  const [marcados, setMarcados] = useState([]);

  const [ordenacao, setOrdenacao] = useState("az");
  const [busca, setBusca] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  // Única carga de dados do modal; os setState acontecem no callback da
  // promessa, não no corpo do efeito.
  useEffect(() => {
    Promise.all([getParticipantesDaClasse(idClasse), getGeneros()])
      .then(([listaParticipantes, listaGeneros]) => {
        setParticipantes(listaParticipantes);
        setGeneros(listaGeneros);
      })
      .catch(() => setErro("Não foi possível carregar os dados da classe."));
  }, [idClasse]);

  // Trocar a unidade no dropdown é um evento, não sincronização de estado: o
  // formulário é reescrito aqui mesmo, sem efeito.
  const selecionarUnidade = (id) => {
    setIdUnidadeSelecionada(id);
    setFormulario(
      formularioDaUnidade(
        unidadesDaClasse.find((item) => String(item.id) === String(id))
      )
    );
    setMarcados([]);
  };

  const alterarCampo = (campo, valor) =>
    setFormulario((atual) => ({ ...atual, [campo]: valor }));

  const listaEsquerda = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return [...participantes]
      .filter((pessoa) => pessoa.nome.toLowerCase().includes(termo))
      .sort((a, b) =>
        ordenacao === "az"
          ? a.nome.localeCompare(b.nome)
          : b.nome.localeCompare(a.nome)
      );
  }, [participantes, busca, ordenacao]);

  const alternar = (id) =>
    setMarcados((atual) =>
      atual.includes(id) ? atual.filter((item) => item !== id) : [...atual, id]
    );

  const marcadosDetalhados = useMemo(
    () => participantes.filter((pessoa) => marcados.includes(pessoa.id)),
    [participantes, marcados]
  );

  const salvar = useCallback(
    async (acaoDesbravadores) => {
      if (!formulario.nome.trim()) {
        setErro("Digite o nome da unidade.");
        return;
      }

      setSalvando(true);
      setErro("");

      try {
        let idUnidade;

        if (edicao) {
          idUnidade = Number(idUnidadeSelecionada);
          await atualizarUnidade(idUnidade, formulario);
        } else {
          const criada = await criarUnidadeNaClasse(idClasse, formulario);
          idUnidade = criada.id;
        }

        if (marcados.length > 0) {
          await definirUnidadeDasPessoas(
            marcados,
            acaoDesbravadores === "remover" ? null : idUnidade
          );
        }

        await onSalvo();
      } catch {
        setErro(
          edicao
            ? "Não foi possível salvar a unidade."
            : "Não foi possível criar a unidade."
        );
      } finally {
        setSalvando(false);
      }
    },
    [
      formulario,
      edicao,
      idUnidadeSelecionada,
      idClasse,
      marcados,
      onSalvo,
    ]
  );

  return (
    <div className={styles.overlay} onMouseDown={onFechar}>
      <div
        className={styles.modal}
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={edicao ? "Editar unidade" : "Criar unidade"}
      >
        <section className={styles.painelLista}>
          <h2 className={styles.titulo}>
            Lista de Desbravadores {nomeClasse ? `Classe ${nomeClasse}` : ""}
          </h2>

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

            <div className={styles.campoBusca}>
              <Input
                type="search"
                placeholder="Buscar"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                aria-label="Buscar desbravador por nome"
              />
            </div>
          </div>

          <div className={styles.lista}>
            {listaEsquerda.length === 0 && (
              <p className={styles.vazio}>Nenhum desbravador nesta classe.</p>
            )}

            {listaEsquerda.map((pessoa) => (
              <label key={pessoa.id} className={styles.linha}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={marcados.includes(pessoa.id)}
                  onChange={() => alternar(pessoa.id)}
                />

                <span className={styles.linhaNome}>{pessoa.nome}</span>
                <span className={styles.linhaDetalhe}>
                  {pessoa.unidade || "Sem unidade"}
                </span>
              </label>
            ))}
          </div>
        </section>

        <aside className={styles.painelFormulario}>
          <button
            type="button"
            className={styles.fechar}
            onClick={onFechar}
            aria-label="Fechar"
          >
            ×
          </button>

          <h3 className={styles.tituloFormulario}>
            {edicao ? "Editar Unidade" : "Criar Unidade"}
          </h3>

          {erro && <p className={styles.erro}>{erro}</p>}

          <div className={styles.campos}>
            {edicao ? (
              <label className={styles.campo}>
                Unidade Selecionada
                <Select
                  value={idUnidadeSelecionada}
                  onChange={(e) => selecionarUnidade(e.target.value)}
                >
                  {unidadesDaClasse.map((unidade) => (
                    <option key={unidade.id} value={unidade.id}>
                      {unidade.nome}
                    </option>
                  ))}
                </Select>
              </label>
            ) : (
              <label className={styles.campo}>
                Nome da Unidade
                <Input
                  type="text"
                  placeholder="Nome da unidade"
                  value={formulario.nome}
                  onChange={(e) => alterarCampo("nome", e.target.value)}
                />
              </label>
            )}

            <label className={styles.campo}>
              Sexo
              <Select
                value={formulario.idGenero}
                onChange={(e) => alterarCampo("idGenero", e.target.value)}
              >
                <option value="">Todos</option>
                {generos.map((genero) => (
                  <option key={genero.id} value={genero.id}>
                    {genero.nome}
                  </option>
                ))}
              </Select>
            </label>

            <label className={styles.campo}>
              Faixa Etária
              <Input
                type="text"
                placeholder="10 – 12"
                value={formulario.faixaEtaria}
                onChange={(e) => alterarCampo("faixaEtaria", e.target.value)}
              />
            </label>

            <label className={styles.campo}>
              Conselheiro da Unidade
              <Select
                value={formulario.idConselheiro}
                onChange={(e) => alterarCampo("idConselheiro", e.target.value)}
              >
                <option value="">Selecione</option>
                {participantes.map((pessoa) => (
                  <option key={pessoa.id} value={pessoa.id}>
                    {pessoa.nome}
                  </option>
                ))}
              </Select>
            </label>
          </div>

          <p className={styles.tituloSelecionados}>
            {edicao
              ? "Desbravadores Selecionados"
              : "Desbravadores a serem adicionados:"}
          </p>

          <div className={styles.caixaSelecionados}>
            {marcadosDetalhados.map((pessoa) => (
              <div key={pessoa.id} className={styles.selecionado}>
                <span className={styles.marca} aria-hidden="true">
                  <CheckIcon sx={{ fontSize: 13 }} />
                </span>
                <span className={styles.selecionadoNome}>{pessoa.nome}</span>
                <span className={styles.selecionadoDetalhe}>
                  {pessoa.unidade || "Sem unidade"}
                </span>
              </div>
            ))}
          </div>

          <div className={styles.botoes}>
            {edicao ? (
              <>
                <button
                  type="button"
                  className={styles.botaoSecundario}
                  onClick={() => salvar("adicionar")}
                  disabled={salvando}
                >
                  Adicionar
                </button>

                <button
                  type="button"
                  className={styles.botaoPerigo}
                  onClick={() => salvar("remover")}
                  disabled={salvando}
                >
                  Remover
                </button>
              </>
            ) : (
              <button
                type="button"
                className={styles.botaoPrimario}
                onClick={() => salvar("adicionar")}
                disabled={salvando}
              >
                {salvando ? "Criando..." : "Criar Unidade"}
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default UnidadeModal;
