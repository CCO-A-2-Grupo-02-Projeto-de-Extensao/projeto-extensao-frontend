import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { StatusBadge } from "../StatusBadge/StatusBadge.jsx";
import { DOCUMENTOS, rotuloCargo } from "../../utils/desbravadorForm.jsx";
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
  if (!aberto || !membro) return null;

  const documentos = membro.documentos ?? {};

  return (
    <div className={modalStyles.overlay}>
      <div className={modalStyles.modal}>
        <header className={modalStyles.cabecalho}>
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
                  {membro.fotoUrl ? (
                    <img
                      src={membro.fotoUrl}
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
                    <span className={styles.tagPapel}>
                      {membro.papel ?? rotuloCargo(membro.categoria)}
                    </span>
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
                <CampoLeitura
                  label="Cargo"
                  valor={rotuloCargo(membro.categoria)}
                />
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
          </div>
        </div>

        <footer className={modalStyles.rodape}>
          <button
            type="button"
            className={modalStyles.botaoCancelar}
            onClick={onFechar}
          >
            Fechar
          </button>
          <button
            type="button"
            className={membro.ativo ? styles.botaoDesativar : styles.botaoReativar}
            onClick={() => onAlterarStatus?.(membro)}
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
    </div>
  );
}

export default DetalhesDesbravadorModal;
