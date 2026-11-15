import { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import { Button } from "../Button/Button.jsx";
import { Select } from "../Select/Select.jsx";
import { ConfirmacaoModal } from "../ConfirmacaoModal/ConfirmacaoModal.jsx";
import { CartaoDocumento } from "../CartaoDocumento/CartaoDocumento.jsx";
import { DOCUMENTO_TERMO_CONSENTIMENTO } from "../../utils/desbravadorForm.jsx";
import { useFecharAoClicarFora } from "../../hooks/useFecharAoClicarFora.js";
import {
  registrarConsentimento,
  revogarConsentimento,
} from "../../services/membrosService.js";

import casca from "../../styles/cascaModal.module.css";
import styles from "../../styles/consentimentoLgpd.module.css";

const DADOS_TRATADOS = [
  "Dados cadastrais, de contato e escolares do desbravador e dos responsáveis.",
  "Ficha médica, medicações e documentos digitalizados, usados para cuidar da saúde dele nas atividades.",
  "Frequência, especialidades e ocorrências, para acompanhar o progresso no clube.",
];

function formatarDataHora(valor) {
  return new Date(valor).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function ModalRegistro({ responsaveis, onFechar, onConfirmar }) {
  const [nome, setNome] = useState(responsaveis[0] ?? "");
  const [aceito, setAceito] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const fecharAoClicarFora = useFecharAoClicarFora(onFechar);

  const aoEnviar = async (evento) => {
    evento.preventDefault();
    setSalvando(true);
    setErro("");
    try {
      await onConfirmar(nome);
    } catch (erroRequisicao) {
      setErro(
        erroRequisicao.response?.data?.erro ??
          "Não foi possível registrar o consentimento."
      );
      setSalvando(false);
    }
  };

  return (
    <div className={casca.overlay} {...fecharAoClicarFora}>
      <form
        className={`${casca.modal} ${styles.modal}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-consentimento"
        onSubmit={aoEnviar}
      >
        <div className={casca.cabecalho}>
          <div>
            <h2 id="titulo-consentimento" className={casca.titulo}>
              Registrar consentimento
            </h2>
            <span className={casca.subtitulo}>
              Lei Geral de Proteção de Dados (LGPD)
            </span>
          </div>
          <Button variante="fechar" onClick={onFechar} aria-label="Fechar">
            <CloseIcon />
          </Button>
        </div>

        <div className={casca.corpo}>
          <span className={casca.secaoTitulo}>O que o clube guarda</span>
          <ul className={styles.itens}>
            {DADOS_TRATADOS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <span className={styles.nota}>
            Os dados não são repassados a terceiros, e o responsável pode pedir a
            revogação a qualquer momento.
          </span>

          {responsaveis.length === 0 ? (
            <div className={casca.alerta}>
              <WarningAmberIcon fontSize="small" />
              Cadastre um responsável em "Editar Informações" antes de registrar o
              consentimento.
            </div>
          ) : (
            <>
              <label className={styles.campo}>
                Responsável que autorizou
                <Select value={nome} onChange={(e) => setNome(e.target.value)}>
                  {responsaveis.map((responsavel) => (
                    <option key={responsavel} value={responsavel}>
                      {responsavel}
                    </option>
                  ))}
                </Select>
              </label>

              <label className={styles.aceite}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={aceito}
                  onChange={(e) => setAceito(e.target.checked)}
                />
                O responsável leu e assinou o termo de consentimento.
              </label>

              <span className={styles.nota}>
                O termo assinado pode ser anexado no próprio cartão de
                consentimento.
              </span>
            </>
          )}

          {erro && <p className={casca.erro}>{erro}</p>}
        </div>

        <div className={casca.rodape}>
          <div className={casca.botoes}>
            <Button variante="secundario" onClick={onFechar}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!aceito || !nome || salvando}>
              {salvando ? "Registrando..." : "Registrar"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

export function ConsentimentoLgpd({
  membro,
  responsaveis,
  termo,
  onAtualizar,
  onAbrirTermo,
  onEnviarTermo,
  onRemoverTermo,
}) {
  const [registrando, setRegistrando] = useState(false);
  const [revogando, setRevogando] = useState(false);
  const registrado = Boolean(membro.consentimentoEm);

  const aoRegistrar = async (nome) => {
    onAtualizar(await registrarConsentimento(membro.id, nome));
    setRegistrando(false);
  };

  const aoRevogar = async () => {
    onAtualizar(await revogarConsentimento(membro.id));
    setRevogando(false);
  };

  return (
    <section
      className={`${styles.cartao} ${registrado ? "" : styles.cartaoPendente}`}
    >
      <div className={styles.cabecalho}>
        {registrado ? (
          <VerifiedUserIcon className={styles.iconeOk} />
        ) : (
          <WarningAmberIcon className={styles.iconeAlerta} />
        )}
        <div className={styles.textos}>
          <h2 className={styles.titulo}>Consentimento LGPD</h2>
          <span className={styles.descricao}>
            {registrado
              ? `Autorizado por ${membro.consentimentoResponsavel} em ${formatarDataHora(
                  membro.consentimentoEm
                )}.`
              : "Falta a autorização do responsável para o clube guardar os dados deste desbravador."}
          </span>
          {registrado && (
            <span className={styles.versao}>
              Termo versão {membro.consentimentoVersao}
            </span>
          )}
        </div>
      </div>

      <ul className={styles.termo}>
        <CartaoDocumento
          documento={DOCUMENTO_TERMO_CONSENTIMENTO}
          arquivo={termo}
          onAbrir={onAbrirTermo}
          onEnviar={onEnviarTermo}
          onRemover={onRemoverTermo}
        />
      </ul>

      {registrado ? (
        <Button variante="secundario" onClick={() => setRevogando(true)}>
          Revogar
        </Button>
      ) : (
        <Button onClick={() => setRegistrando(true)}>
          Registrar consentimento
        </Button>
      )}

      {registrando && (
        <ModalRegistro
          responsaveis={responsaveis}
          onFechar={() => setRegistrando(false)}
          onConfirmar={aoRegistrar}
        />
      )}

      <ConfirmacaoModal
        aberto={revogando}
        titulo="Revogar consentimento"
        mensagem="A autorização sai do cadastro e o desbravador volta a aparecer como pendente."
        textoConfirmar="Revogar"
        perigo
        onConfirmar={aoRevogar}
        onCancelar={() => setRevogando(false)}
      />
    </section>
  );
}

export default ConsentimentoLgpd;
