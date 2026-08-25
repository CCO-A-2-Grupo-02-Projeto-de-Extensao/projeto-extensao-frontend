import { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import SchoolIcon from "@mui/icons-material/School";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { StatusBadge } from "../StatusBadge/StatusBadge.jsx";
import { HistoricoEscolarModal } from "../HistoricoEscolarModal/HistoricoEscolarModal.jsx";
import { DesempenhoClubeModal } from "../DesempenhoClubeModal/DesempenhoClubeModal.jsx";
import { ConfirmacaoModal } from "../ConfirmacaoModal/ConfirmacaoModal.jsx";
import { listarDocumentosDaPessoa } from "../../services/documentosService.js";
import { DOCUMENTOS } from "../../utils/desbravadorForm.jsx";
import modalStyles from "../../styles/cadastroDesbravadorModal.module.css";
import styles from "../../styles/detalhesDesbravadorModal.module.css";

function formatarData(valor) {
  if (!valor) return null;
  const data = new Date(`${valor}T00:00:00`);
  if (Number.isNaN(data.getTime())) return valor;
  return data.toLocaleDateString("pt-BR");
}

function CampoLeitura({ label, valor }) {
  return (
    <div className={modalStyles.campo}>
      <span className={modalStyles.campoLabel}>{label}</span>
      {valor ? (
        <span className={styles.valor}>{valor}</span>
      ) : (
        <span className={styles.valorVazio}>Não informado</span>
      )}
    </div>
  );
}

function SecaoResponsavel({ titulo, membro, sufixo }) {
  const nome = membro[`nomeResponsavel${sufixo}`];
  const telefone = membro[`telefoneResponsavel${sufixo}`];
  const rg = membro[`rgResponsavel${sufixo}`];
  const cpf = membro[`cpfResponsavel${sufixo}`];

  return (
    <section className={modalStyles.secao}>
      <h3 className={modalStyles.secaoTitulo}>{titulo}</h3>
      {nome || telefone || rg || cpf ? (
        <div className={modalStyles.grid}>
          <div className={modalStyles.campoSpan2}>
            <span className={modalStyles.campoLabel}>Nome</span>
            {nome ? (
              <span className={styles.valor}>{nome}</span>
            ) : (
              <span className={styles.valorVazio}>Não informado</span>
            )}
          </div>
          <CampoLeitura label="Telefone" valor={telefone} />
          <CampoLeitura label="RG" valor={rg} />
          <CampoLeitura label="CPF" valor={cpf} />
        </div>
      ) : (
        <p className={styles.mensagemVazia}>Nenhum responsável cadastrado.</p>
      )}
    </section>
  );
}

export function DetalhesDesbravadorModal({
  aberto,
  membro,
  onFechar,
  onEditar,
  onAlterarStatus,
}) {
  const [modalHistoricoAberto, setModalHistoricoAberto] = useState(false);
  const [modalDesempenhoAberto, setModalDesempenhoAberto] = useState(false);
  const [confirmacaoAberta, setConfirmacaoAberta] = useState(false);
  const [documentos, setDocumentos] = useState({});

  useEffect(() => {
    if (aberto && membro) {
      listarDocumentosDaPessoa(membro.id).then(setDocumentos);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só recarrega ao (re)abrir para o mesmo/outro membro
  }, [aberto, membro?.id]);

  if (!aberto || !membro) return null;

  // Reativar é reversível e segue direto; só a desativação pede confirmação.
  const aoClicarAlterarStatus = () => {
    if (membro.ativo) {
      setConfirmacaoAberta(true);
    } else {
      onAlterarStatus?.(membro);
    }
  };

  const confirmarDesativacao = () => {
    setConfirmacaoAberta(false);
    onAlterarStatus?.(membro);
  };

  return (
    <div className={modalStyles.overlay}>
      <div className={modalStyles.modal}>
        <header className={`${modalStyles.cabecalho} ${styles.cabecalhoLinha}`}>
          <div>
            <h2 className={modalStyles.titulo}>Detalhes do Desbravador</h2>
            <p className={modalStyles.subtitulo}>
              Informações completas do membro selecionado.
            </p>
          </div>
          <button
            type="button"
            className={modalStyles.botaoFechar}
            onClick={onFechar}
            aria-label="Fechar"
          >
            <CloseIcon />
          </button>
        </header>

        <div className={modalStyles.corpo}>
          <div className={modalStyles.painelWrapper}>
            <section className={modalStyles.secao}>
              <div className={styles.perfil}>
                <div className={styles.perfilAvatar}>
                  {documentos.foto?.url ? (
                    <img
                      src={documentos.foto.url}
                      alt={`Foto de ${membro.nome}`}
                      className={styles.perfilAvatarImagem}
                    />
                  ) : (
                    <PersonIcon sx={{ fontSize: 52, color: "var(--carvao)" }} />
                  )}
                </div>
                <div>
                  <h3 className={styles.perfilNome}>{membro.nome}</h3>
                  <div className={styles.perfilBadges}>
                    <span className={styles.tagPapel}>{membro.papel}</span>
                    <span
                      className={`${styles.tagStatus} ${
                        membro.ativo ? styles.tagStatusAtivo : styles.tagStatusInativo
                      }`}
                    >
                      {membro.ativo ? "Ativo" : "Inativo"}
                    </span>
                    <StatusBadge completo={membro.documentacao} />
                  </div>
                </div>
              </div>
            </section>

            <section className={modalStyles.secao}>
              <h3 className={modalStyles.secaoTitulo}>Dados pessoais</h3>
              <div className={modalStyles.grid}>
                <CampoLeitura
                  label="Data de nascimento"
                  valor={formatarData(membro.dataNascimento)}
                />
                <CampoLeitura label="Gênero" valor={membro.genero} />
                <CampoLeitura label="Telefone" valor={membro.telefone} />
              </div>
            </section>

            <section className={modalStyles.secao}>
              <h3 className={modalStyles.secaoTitulo}>Informações do clube</h3>
              <div className={modalStyles.grid}>
                <CampoLeitura label="Cargo" valor={membro.papel} />
                <CampoLeitura label="Classe" valor={membro.classe} />
                <CampoLeitura label="Unidade" valor={membro.unidade} />
              </div>
            </section>

            <section className={modalStyles.secao}>
              <h3 className={modalStyles.secaoTitulo}>Dados escolares</h3>
              <div className={modalStyles.grid}>
                <CampoLeitura label="Escola" valor={membro.escola} />
                <CampoLeitura label="Turma" valor={membro.turma} />
              </div>
            </section>

            <SecaoResponsavel titulo="Responsável 1" membro={membro} sufixo="1" />
            <SecaoResponsavel titulo="Responsável 2" membro={membro} sufixo="2" />

            <section className={modalStyles.secao}>
              <h3 className={modalStyles.secaoTitulo}>Documentos</h3>
              <div className={modalStyles.documentosGrid}>
                {DOCUMENTOS.map((documento) => {
                  const arquivo = documentos[documento.id];
                  return (
                    <div key={documento.id} className={styles.documentoItem}>
                      <div className={styles.documentoInfo}>
                        {arquivo ? (
                          <CheckCircleIcon
                            fontSize="small"
                            className={styles.documentoStatusEnviado}
                          />
                        ) : (
                          <RadioButtonUncheckedIcon
                            fontSize="small"
                            className={styles.documentoStatusPendente}
                          />
                        )}
                        <span className={styles.documentoTitulo}>
                          {documento.titulo}
                        </span>
                      </div>
                      {arquivo && (
                        <button
                          type="button"
                          className={styles.botaoVisualizar}
                          onClick={() => window.open(arquivo.url, "_blank")}
                        >
                          Visualizar
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            <section className={modalStyles.secao}>
              <h3 className={modalStyles.secaoTitulo}>Histórico Escolar e Desempenho</h3>
              <div className={modalStyles.documentosGrid}>
                <button
                  type="button"
                  className={styles.cardAcao}
                  onClick={() => setModalHistoricoAberto(true)}
                >
                  <div className={styles.documentoInfo}>
                    <SchoolIcon fontSize="small" className={styles.iconeNavegacao} />
                    <span className={styles.documentoTitulo}>Histórico Escolar</span>
                  </div>
                  <ChevronRightIcon fontSize="small" className={styles.iconeSeta} />
                </button>
                <button
                  type="button"
                  className={styles.cardAcao}
                  onClick={() => setModalDesempenhoAberto(true)}
                >
                  <div className={styles.documentoInfo}>
                    <MilitaryTechIcon fontSize="small" className={styles.iconeNavegacao} />
                    <span className={styles.documentoTitulo}>Desempenho no Clube</span>
                  </div>
                  <ChevronRightIcon fontSize="small" className={styles.iconeSeta} />
                </button>
              </div>
            </section>

            <div className={styles.espacoInferior} />
          </div>
        </div>

        <footer className={modalStyles.rodape}>
          <button
            type="button"
            className={membro.ativo ? styles.botaoDesativar : styles.botaoReativar}
            onClick={aoClicarAlterarStatus}
          >
            {membro.ativo ? "Desativar" : "Reativar"}
          </button>
          <button
            type="button"
            className={modalStyles.botaoCadastrar}
            onClick={() => onEditar?.(membro)}
          >
            Editar
          </button>
        </footer>
      </div>

      <HistoricoEscolarModal
        aberto={modalHistoricoAberto}
        membro={membro}
        onFechar={() => setModalHistoricoAberto(false)}
        onSalvar={() => setModalHistoricoAberto(false)}
      />

      <DesempenhoClubeModal
        aberto={modalDesempenhoAberto}
        membro={membro}
        onFechar={() => setModalDesempenhoAberto(false)}
        onSalvar={() => setModalDesempenhoAberto(false)}
      />

      <ConfirmacaoModal
        aberto={confirmacaoAberta}
        titulo="Desativar desbravador"
        mensagem={`${membro.nome} deixará de aparecer nas listagens e chamadas do clube. É possível reativar depois.`}
        textoConfirmar="Desativar"
        perigo
        onConfirmar={confirmarDesativacao}
        onCancelar={() => setConfirmacaoAberta(false)}
      />
    </div>
  );
}

export default DetalhesDesbravadorModal;
