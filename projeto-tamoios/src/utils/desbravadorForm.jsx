import { Select } from "../components/Select/Select.jsx";
import { Input } from "../components/Input/Input.jsx";
import { CATEGORIAS } from "../services/membrosService.js";

export const OPCOES_CARGO = [
  { value: CATEGORIAS.ADMINISTRATIVO, label: "Administrativo" },
  { value: CATEGORIAS.INSTRUTOR, label: "Instrutor" },
  { value: CATEGORIAS.ALUNO, label: "Aluno" },
];

export const OPCOES_GENERO = ["Masculino", "Feminino", "Prefiro não informar"].map(
  (valor) => ({ value: valor, label: valor })
);

export const OPCOES_CLASSE = [
  "Amigo",
  "Companheiro",
  "Pesquisador",
  "Pioneiro",
  "Excursionista",
  "Guia",
].map((valor) => ({ value: valor, label: valor }));

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
  { id: "desempenhoEscolar", titulo: "Desempenho Escolar" },
  { id: "autorizacaoClube", titulo: "Autorização do Clube" },
];

export const CAMPO_NOME = {
  name: "nome",
  label: "Nome completo",
  type: "text",
  span: 2,
  obrigatorio: true,
};

export const SECOES_FORMULARIO = [
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
      { name: "genero", label: "Gênero", type: "select", opcoes: OPCOES_GENERO },
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
      { name: "cargo", label: "Cargo", type: "select", opcoes: OPCOES_CARGO },
      { name: "classe", label: "Classe", type: "select", opcoes: OPCOES_CLASSE },
      { name: "unidade", label: "Unidade", type: "text" },
    ],
  },
  {
    titulo: "Dados escolares",
    campos: [
      { name: "escola", label: "Escola", type: "text" },
      { name: "turma", label: "Turma", type: "text" },
    ],
  },
  {
    titulo: "Responsável 1",
    campos: [
      { name: "nomeResponsavel1", label: "Nome", type: "text", span: 2 },
      {
        name: "telefoneResponsavel1",
        label: "Telefone",
        type: "tel",
        mascara: mascararTelefone,
        validar: telefoneValido,
        mensagemErro: "Telefone inválido. Use o formato (00) 00000-0000.",
      },
      {
        name: "rgResponsavel1",
        label: "RG",
        type: "text",
        mascara: mascararRg,
        validar: rgValido,
        mensagemErro: "RG inválido.",
      },
      {
        name: "cpfResponsavel1",
        label: "CPF",
        type: "text",
        mascara: mascararCpf,
        validar: cpfValido,
        mensagemErro: "CPF inválido.",
      },
    ],
  },
  {
    titulo: "Responsável 2 (opcional)",
    campos: [
      { name: "nomeResponsavel2", label: "Nome", type: "text", span: 2 },
      {
        name: "telefoneResponsavel2",
        label: "Telefone",
        type: "tel",
        mascara: mascararTelefone,
        validar: telefoneValido,
        mensagemErro: "Telefone inválido. Use o formato (00) 00000-0000.",
      },
      {
        name: "rgResponsavel2",
        label: "RG",
        type: "text",
        mascara: mascararRg,
        validar: rgValido,
        mensagemErro: "RG inválido.",
      },
      {
        name: "cpfResponsavel2",
        label: "CPF",
        type: "text",
        mascara: mascararCpf,
        validar: cpfValido,
        mensagemErro: "CPF inválido.",
      },
    ],
  },
];

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

export function rotuloCargo(categoria) {
  return OPCOES_CARGO.find((opcao) => opcao.value === categoria)?.label ?? "Aluno";
}
