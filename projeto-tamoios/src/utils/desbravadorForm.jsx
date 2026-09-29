import { Select } from "../components/Select/Select.jsx";
import { Input } from "../components/Input/Input.jsx";
import { CATEGORIAS } from "../services/membrosService.js";
import { cabeNaUnidade, temVaga } from "./regrasUnidade.js";

const ROTULOS_CATEGORIA = {
  [CATEGORIAS.ADMINISTRATIVO]: "Administrativo",
  [CATEGORIAS.INSTRUTOR]: "Instrutor",
  [CATEGORIAS.ALUNO]: "Aluno",
};

const somenteDigitos = (valor) => valor.replace(/\D/g, "");

export function mascararTelefone(valor) {
  const digitos = somenteDigitos(valor).slice(0, 11);
  if (digitos.length > 10) {
    return digitos.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  if (digitos.length > 5) {
    return digitos.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
  }
  if (digitos.length > 2) {
    return digitos.replace(/(\d{2})(\d{0,5})/, "($1) $2");
  }
  return digitos.replace(/(\d{0,2})/, "($1");
}

export function mascararCpf(valor) {
  return somenteDigitos(valor)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function mascararRg(valor) {
  return valor
    .toUpperCase()
    .replace(/[^0-9X]/g, "")
    .slice(0, 9)
    .replace(/(\d{2})(\w)/, "$1.$2")
    .replace(/(\d{3})(\w)/, "$1.$2")
    .replace(/(\d{3})([\dX]{1,2})$/, "$1-$2");
}

export function telefoneValido(valor) {
  const digitos = somenteDigitos(valor);
  return digitos.length === 10 || digitos.length === 11;
}

export function rgValido(valor) {
  return somenteDigitos(valor).length >= 7;
}

export function cpfValido(valor) {
  const cpf = somenteDigitos(valor);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += Number(cpf[i]) * (10 - i);
  let digitoVerificador1 = (soma * 10) % 11;
  if (digitoVerificador1 === 10) digitoVerificador1 = 0;
  if (digitoVerificador1 !== Number(cpf[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += Number(cpf[i]) * (11 - i);
  let digitoVerificador2 = (soma * 10) % 11;
  if (digitoVerificador2 === 10) digitoVerificador2 = 0;
  return digitoVerificador2 === Number(cpf[10]);
}

export function dataNascimentoValida(valor) {
  const data = new Date(valor);
  return !Number.isNaN(data.getTime()) && data <= new Date();
}

export const DOCUMENTOS = [
  { id: "certidaoNascimento", titulo: "Certidão de Nascimento" },
  { id: "cartaoSus", titulo: "Cartão SUS" },
  { id: "carteiraVacinacao", titulo: "Carteira de Vacinação" },
  { id: "carteiraConvenio", titulo: "Carteira do Convênio" },
  { id: "comprovanteEndereco", titulo: "Comprovante de Endereço" },
  { id: "fichaMedica", titulo: "Ficha Médica" },
  { id: "receitaMedica", titulo: "Receita Médica" },
  { id: "autorizacaoClube", titulo: "Autorização do Clube" },
];

export const CAMPO_NOME = {
  name: "nome",
  label: "Nome completo",
  type: "text",
  span: 2,
  obrigatorio: true,
};

function paraOpcoes(lista) {
  return lista.map((item) => ({ value: String(item.id), label: item.nome }));
}

// Monta as seções do formulário com as opções reais vindas do backend
// (Cargo/Classe/Gênero/Unidade — ver useCatalogos). O `value` de cada opção
// é o id numérico (como string, formato padrão de <select>), resolvido de
// volta pra número na hora de montar o request (ver membrosService).
export function criarSecoesFormulario({ cargos, classes, generos, unidades }, pessoa = {}) {
  const opcoesGenero = [
    ...paraOpcoes(generos),
    { value: "", label: "Prefiro não informar" },
  ];

  const candidato = {
    idGenero: pessoa.genero,
    dataNascimento: pessoa.dataNascimento,
  };

  const unidadesCompativeis = unidades.filter(
    (unidade) =>
      String(unidade.id) === String(pessoa.unidade ?? "") ||
      (temVaga(unidade) && cabeNaUnidade(candidato, unidade))
  );

  return [
    {
      titulo: "Dados pessoais",
      campos: [
        {
          name: "dataNascimento",
          label: "Data de nascimento",
          type: "date",
          obrigatorio: true,
          validar: dataNascimentoValida,
          mensagemErro: "Data de nascimento inválida — não pode ser no futuro.",
        },
        { name: "genero", label: "Gênero", type: "select", opcoes: opcoesGenero },
        {
          name: "telefone",
          label: "Telefone",
          type: "tel",
          mascara: mascararTelefone,
          validar: telefoneValido,
          mensagemErro: "Telefone inválido. Use o formato (00) 00000-0000.",
        },
      ],
    },
    {
      titulo: "Informações do clube",
      campos: [
        { name: "cargo", label: "Cargo", type: "select", opcoes: paraOpcoes(cargos) },
        { name: "classe", label: "Classe", type: "select", opcoes: paraOpcoes(classes) },
        {
          name: "unidade",
          label: "Unidade",
          type: "select",
          opcoes: paraOpcoes(unidadesCompativeis),
        },
      ],
    },
    {
      titulo: "Dados escolares",
      campos: [
        { name: "escola", label: "Escola", type: "text" },
        { name: "turma", label: "Turma", type: "text" },
      ],
    },
  ];
}

export function calcularSpans(campos) {
  const resultado = campos.map((campo) => ({ ...campo, spanEfetivo: 1 }));
  let inicioSegmento = 0;

  const fecharSegmento = (fim) => {
    if ((fim - inicioSegmento) % 2 === 1) {
      resultado[fim - 1].spanEfetivo = 2;
    }
  };

  resultado.forEach((campo, indice) => {
    if (campo.span === 2) {
      fecharSegmento(indice);
      campo.spanEfetivo = 2;
      inicioSegmento = indice + 1;
    }
  });
  fecharSegmento(resultado.length);

  return resultado;
}

export function renderCampo(campo, formData, aoMudarCampo, erro, campoComErro, styles) {
  const valor = formData[campo.name] ?? "";
  const classeCampo = campo.spanEfetivo === 2 ? styles.campoSpan2 : styles.campo;
  const emErro = campo.name === campoComErro;

  return (
    <div key={campo.name} className={classeCampo}>
      <label className={styles.campoLabel} htmlFor={campo.name}>
        {campo.label}
        {campo.obrigatorio ? (
          <span className={styles.obrigatorio}> *</span>
        ) : (
          <span className={styles.opcional}> (opcional)</span>
        )}
      </label>

      {campo.type === "select" ? (
        <Select
          id={campo.name}
          value={valor}
          onChange={(e) => aoMudarCampo(campo, e.target.value)}
        >
          <option value="">Selecione...</option>
          {campo.opcoes.map((opcao) => (
            <option key={opcao.value} value={opcao.value}>
              {opcao.label}
            </option>
          ))}
        </Select>
      ) : (
        <Input
          id={campo.name}
          type={campo.type}
          value={valor}
          onChange={(e) => aoMudarCampo(campo, e.target.value)}
          required={campo.obrigatorio}
          style={emErro ? { borderColor: "var(--vermelho)" } : undefined}
        />
      )}

      {emErro && <p className={styles.campoErro}>{erro}</p>}
    </div>
  );
}

export function validarCampos(campos, formData) {
  for (const campo of campos) {
    const valor = String(formData[campo.name] ?? "").trim();

    if (campo.obrigatorio && !valor) {
      return {
        campo: campo.name,
        mensagem: `Preencha o campo "${campo.label}" para continuar.`,
      };
    }

    if (valor && campo.validar && !campo.validar(valor)) {
      return {
        campo: campo.name,
        mensagem: campo.mensagemErro ?? `Campo "${campo.label}" inválido.`,
      };
    }
  }
  return null;
}

export const MAX_RESPONSAVEIS = 2;

const PREFIXOS_RESPONSAVEL = ["nome", "telefone", "rg", "cpf"];

export function camposResponsavel(numero, nomeObrigatorio = false) {
  return [
    { name: `nomeResponsavel${numero}`, label: "Nome", type: "text", span: 2, obrigatorio: nomeObrigatorio },
    {
      name: `telefoneResponsavel${numero}`,
      label: "Telefone",
      type: "tel",
      mascara: mascararTelefone,
      validar: telefoneValido,
      mensagemErro: "Telefone inválido. Use o formato (00) 00000-0000.",
    },
    {
      name: `rgResponsavel${numero}`,
      label: "RG",
      type: "text",
      mascara: mascararRg,
      validar: rgValido,
      mensagemErro: "RG inválido.",
    },
    {
      name: `cpfResponsavel${numero}`,
      label: "CPF",
      type: "text",
      mascara: mascararCpf,
      validar: cpfValido,
      mensagemErro: "CPF inválido.",
    },
  ];
}

function responsavelTemDados(formData, numero) {
  return PREFIXOS_RESPONSAVEL.some(
    (prefixo) => String(formData[`${prefixo}Responsavel${numero}`] ?? "").trim() !== ""
  );
}

export function contarResponsaveis(formData) {
  for (let numero = MAX_RESPONSAVEIS; numero > 0; numero--) {
    if (responsavelTemDados(formData, numero)) return numero;
  }
  return 0;
}

export function calcularIdade(dataNascimento) {
  if (!dataNascimento || !dataNascimentoValida(dataNascimento)) return null;
  const [ano, mes, dia] = dataNascimento.split("-").map(Number);
  const hoje = new Date();
  const jaFezAniversario =
    hoje.getMonth() + 1 > mes || (hoje.getMonth() + 1 === mes && hoje.getDate() >= dia);
  return hoje.getFullYear() - ano - (jaFezAniversario ? 0 : 1);
}

export function exigeResponsavel(formData) {
  const idade = calcularIdade(formData.dataNascimento);
  return idade !== null && idade < 18;
}

export function removerResponsavel(formData, numero, quantidade) {
  const copia = { ...formData };
  for (let atual = numero; atual <= quantidade; atual++) {
    PREFIXOS_RESPONSAVEL.forEach((prefixo) => {
      copia[`${prefixo}Responsavel${atual}`] = copia[`${prefixo}Responsavel${atual + 1}`] ?? "";
    });
  }
  return copia;
}

export function validarResponsaveis(formData, quantidade) {
  for (let numero = 1; numero <= quantidade; numero++) {
    const resultado = validarCampos(
      camposResponsavel(numero, responsavelTemDados(formData, numero)),
      formData
    );
    if (resultado) return resultado;
  }
  if (exigeResponsavel(formData) && contarResponsaveis(formData) === 0) {
    return {
      campo: quantidade > 0 ? "nomeResponsavel1" : "responsaveis",
      mensagem: "Desbravadores menores de 18 anos precisam de pelo menos um responsável.",
    };
  }
  return null;
}

export function renderResponsaveis({
  formData,
  quantidade,
  onAdicionar,
  onRemover,
  aoMudarCampo,
  erro,
  campoComErro,
  styles,
}) {
  const obrigatorio = exigeResponsavel(formData);

  return (
    <>
      <p className={styles.documentosSubtitulo}>
        {obrigatorio
          ? "Desbravador menor de 18 anos: informe pelo menos um responsável."
          : "Opcional para desbravadores com 18 anos ou mais."}
      </p>

      {Array.from({ length: quantidade }, (_, indice) => indice + 1).map((numero) => (
        <div key={numero} className={styles.responsavelBloco}>
          <div className={styles.responsavelCabecalho}>
            <h4 className={styles.responsavelTitulo}>Responsável {numero}</h4>
            <button
              type="button"
              className={styles.botaoRemoverResponsavel}
              onClick={() => onRemover(numero)}
            >
              Remover
            </button>
          </div>
          <div className={styles.grid}>
            {calcularSpans(camposResponsavel(numero, obrigatorio && numero === 1)).map((campo) =>
              renderCampo(campo, formData, aoMudarCampo, erro, campoComErro, styles)
            )}
          </div>
        </div>
      ))}

      {campoComErro === "responsaveis" && <p className={styles.campoErro}>{erro}</p>}

      {quantidade < MAX_RESPONSAVEIS && (
        <button type="button" className={styles.botaoFoto} onClick={onAdicionar}>
          Adicionar responsável
        </button>
      )}
    </>
  );
}

export function rotuloCargo(categoria) {
  return ROTULOS_CATEGORIA[categoria] ?? "Aluno";
}
