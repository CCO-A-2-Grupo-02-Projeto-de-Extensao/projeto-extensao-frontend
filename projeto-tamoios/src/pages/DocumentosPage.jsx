import { useEffect, useMemo, useState } from "react";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { ConfirmacaoModal } from "../components/ConfirmacaoModal/ConfirmacaoModal.jsx";
import { Esqueleto } from "../components/Esqueleto/Esqueleto.jsx";
import api from "../services/api.js";
import { removerDocumento } from "../services/documentosService.js";
import styles from "../styles/documentoPage.module.css";

function obterIniciais(nome = "") {
  const nomeSemExtensao = nome.replace(/\.[^.]+$/, "");
  const partes = nomeSemExtensao
    .trim()
    .split(/[\s_-]+/)
    .filter(Boolean);

  if (partes.length > 1) {
    return `${partes[0][0]}${partes[1][0]}`.toLocaleUpperCase("pt-BR");
  }

  return (partes[0]?.slice(0, 2) || "AR").toLocaleUpperCase("pt-BR");
}

function formatarTamanho(tamanho) {
  const bytes = Number(tamanho);

  if (!Number.isFinite(bytes) || bytes < 0) {
    return "Tamanho indisponível";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const unidades = ["KB", "MB", "GB"];
  let valor = bytes / 1024;
  let indice = 0;

  while (valor >= 1024 && indice < unidades.length - 1) {
    valor /= 1024;
    indice += 1;
  }

  return `${new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 1,
  }).format(valor)} ${unidades[indice]}`;
}

function formatarData(data) {
  if (!data) {
    return "Data não informada";
  }

  const dataUpload = new Date(data);

  if (Number.isNaN(dataUpload.getTime())) {
    return "Data não informada";
  }

  return dataUpload.toLocaleDateString("pt-BR");
}

function obterTipo(documento) {
  return (
    documento.mimeType?.split("/").pop()?.toUpperCase() ||
    documento.nomeOriginal?.split(".").pop()?.toUpperCase() ||
    "ARQUIVO"
  );
}

export function DocumentosPage() {
  const [documentos, setDocumentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");
  const [documentoParaExcluir, setDocumentoParaExcluir] = useState(null);
  const [acaoEmAndamento, setAcaoEmAndamento] = useState(null);

  useEffect(() => {
    let ativo = true;

    function obterIdPessoa() {
      const usuarioSalvo = localStorage.getItem("usuario");

      if (!usuarioSalvo) {
        return null;
      }

      try {
        const usuario = JSON.parse(usuarioSalvo);
        const idPessoa = Number(
          usuario?.idPessoa ??
            usuario?.Pessoa_idPessoa ??
            usuario?.pessoa?.idPessoa ??
            usuario?.idUsuario,
        );

        return Number.isSafeInteger(idPessoa) && idPessoa > 0
          ? idPessoa
          : null;
      } catch {
        return null;
      }
    }

    async function carregarDocumentos() {
      const idPessoa = obterIdPessoa();

      if (!idPessoa) {
        setCarregando(false);
        setErro("Nenhum usuário válido foi encontrado no navegador.");
        setDocumentos([]);
        return;
      }

      try {
        setCarregando(true);
        setErro("");

        const resposta = await api.get(`/documentos/pessoa/${idPessoa}`);

        if (!ativo) {
          return;
        }

        setDocumentos(Array.isArray(resposta.data) ? resposta.data : []);
      } catch (error) {
        if (!ativo) {
          return;
        }

        console.error("Erro ao carregar documentos:", error);
        setErro("Não foi possível carregar os documentos desta pessoa.");
        setDocumentos([]);
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    carregarDocumentos();

    return () => {
      ativo = false;
    };
  }, []);

  const documentosFiltrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");

    return documentos.filter((documento) =>
      documento.nomeOriginal?.toLocaleLowerCase("pt-BR").includes(termo),
    );
  }, [busca, documentos]);

  async function visualizarDocumento(documento) {
    const novaAba = window.open("", "_blank");

    if (!novaAba) {
      setErro("Permita a abertura de novas abas para visualizar o documento.");
      return;
    }

    setAcaoEmAndamento(documento.id);
    setErro("");

    try {
      const resposta = await api.get(
        `/documentos/${documento.id}/visualizar`,
        { responseType: "blob" },
      );
      const url = URL.createObjectURL(resposta.data);

      novaAba.location.href = url;
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (error) {
      novaAba.close();
      console.error("Erro ao visualizar o documento:", error);
      setErro(`Não foi possível abrir "${documento.nomeOriginal}".`);
    } finally {
      setAcaoEmAndamento(null);
    }
  }

  async function baixarDocumento(documento) {
    setAcaoEmAndamento(documento.id);
    setErro("");

    try {
      const resposta = await api.get(
        `/documentos/${documento.id}/visualizar`,
        { responseType: "blob" },
      );
      const url = URL.createObjectURL(resposta.data);
      const link = window.document.createElement("a");

      link.href = url;
      link.download = documento.nomeOriginal || `documento-${documento.id}`;
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (error) {
      console.error("Erro ao baixar o documento:", error);
      setErro(`Não foi possível baixar "${documento.nomeOriginal}".`);
    } finally {
      setAcaoEmAndamento(null);
    }
  }

  async function confirmarExclusao() {
    if (!documentoParaExcluir || acaoEmAndamento !== null) {
      return;
    }

    const documento = documentoParaExcluir;
    setAcaoEmAndamento(documento.id);
    setErro("");

    try {
      await removerDocumento(documento.id);
      setDocumentos((atuais) =>
        atuais.filter((item) => item.id !== documento.id),
      );
      setDocumentoParaExcluir(null);
    } catch (error) {
      console.error("Erro ao excluir o documento:", error);
      setErro(`Não foi possível excluir "${documento.nomeOriginal}".`);
      setDocumentoParaExcluir(null);
    } finally {
      setAcaoEmAndamento(null);
    }
  }

  return (
    <section className={styles.page}>
      <header className={styles.cabecalho}>
        <div className={styles.cabecalhoTextos}>
          <p className={styles.sobretitulo}>Clube Tamoios</p>
          <h1 className={styles.titulo}>Documentos</h1>
          <p className={styles.subtitulo}>
            Acesse e organize os documentos vinculados ao seu cadastro.
          </p>
        </div>
        {!carregando && !erro && (
          <span className={styles.contador}>
            {documentos.length}{" "}
            {documentos.length === 1 ? "documento" : "documentos"}
          </span>
        )}
      </header>

      <section className={styles.painel} aria-label="Lista de documentos">
        <div className={styles.painelCabecalho}>
          <div>
            <h2 className={styles.tituloPainel}>Arquivos</h2>
            <p className={styles.descricaoPainel}>
              Visualize ou baixe seus documentos com segurança.
            </p>
          </div>
          <label className={styles.busca}>
            <SearchOutlinedIcon aria-hidden="true" />
            <input
              type="search"
              value={busca}
              onChange={(evento) => setBusca(evento.target.value)}
              placeholder="Buscar documento"
              aria-label="Buscar documento pelo nome"
            />
          </label>
        </div>

        {erro && (
          <p className={styles.mensagemErro} role="alert">
            {erro}
          </p>
        )}

        {carregando && (
          <div className={styles.carregando}>
            <Esqueleto
              linhas={4}
              altura={76}
              rotulo="Carregando documentos"
            />
          </div>
        )}

        {!carregando && !erro && documentos.length === 0 && (
          <div className={styles.estadoVazio}>
            <span className={styles.iconeVazio}>
              <DescriptionOutlinedIcon aria-hidden="true" />
            </span>
            <h3>Nenhum documento por aqui</h3>
            <p>Os documentos vinculados ao seu cadastro aparecerão nesta lista.</p>
          </div>
        )}

        {!carregando &&
          !erro &&
          documentos.length > 0 &&
          documentosFiltrados.length === 0 && (
            <div className={styles.estadoVazio}>
              <span className={styles.iconeVazio}>
                <SearchOutlinedIcon aria-hidden="true" />
              </span>
              <h3>Nenhum resultado encontrado</h3>
              <p>Tente buscar por outro nome de documento.</p>
            </div>
          )}

        {!carregando && !erro && documentosFiltrados.length > 0 && (
          <ul className={styles.lista}>
            {documentosFiltrados.map((documento) => (
              <li className={styles.item} key={documento.id}>
                <span className={styles.avatar} aria-hidden="true">
                  {obterIniciais(documento.nomeOriginal)}
                </span>

                <div className={styles.detalhes}>
                  <h3 className={styles.nomeDocumento}>
                    {documento.nomeOriginal || "Documento sem nome"}
                  </h3>
                  <p className={styles.metadados}>
                    <span>{obterTipo(documento)}</span>
                    <span aria-hidden="true">·</span>
                    <span>{formatarTamanho(documento.tamanho)}</span>
                    <span aria-hidden="true">·</span>
                    <span>Enviado em {formatarData(documento.dataUpload)}</span>
                  </p>
                </div>

                <div className={styles.acoes}>
                  <button
                    type="button"
                    className={styles.botaoVisualizar}
                    onClick={() => visualizarDocumento(documento)}
                    disabled={acaoEmAndamento === documento.id}
                    aria-label={`Visualizar ${documento.nomeOriginal}`}
                    title="Visualizar documento"
                  >
                    <OpenInNewOutlinedIcon aria-hidden="true" />
                    <span>Visualizar</span>
                  </button>
                  <button
                    type="button"
                    className={styles.botaoBaixar}
                    onClick={() => baixarDocumento(documento)}
                    disabled={acaoEmAndamento === documento.id}
                    aria-label={`Baixar ${documento.nomeOriginal}`}
                    title="Baixar documento"
                  >
                    <DownloadOutlinedIcon aria-hidden="true" />
                    <span>Baixar</span>
                  </button>
                  <button
                    type="button"
                    className={styles.botaoExcluir}
                    onClick={() => setDocumentoParaExcluir(documento)}
                    disabled={acaoEmAndamento === documento.id}
                    aria-label={`Excluir ${documento.nomeOriginal}`}
                    title="Excluir documento"
                  >
                    <DeleteOutlineIcon aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ConfirmacaoModal
        aberto={Boolean(documentoParaExcluir)}
        titulo="Excluir documento?"
        mensagem={
          documentoParaExcluir
            ? `O arquivo "${documentoParaExcluir.nomeOriginal}" será removido permanentemente.`
            : ""
        }
        textoConfirmar="Excluir documento"
        perigo
        onConfirmar={confirmarExclusao}
        onCancelar={() => setDocumentoParaExcluir(null)}
      />
    </section>
  );
}
