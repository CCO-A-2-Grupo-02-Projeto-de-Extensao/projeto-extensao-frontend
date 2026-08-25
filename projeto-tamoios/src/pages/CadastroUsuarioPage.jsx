import NomePagina from "../components/NomePagina/NomePagina";
import { DashboardLayout } from "../layout/DashboardLayout";
import { Input } from "../components/Input/Input.jsx";
import Select from "../components/Select/Select.jsx";
import { Button } from "../components/Button/Button.jsx";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

export function CadastroUsuarioPage() {
  return (
    <DashboardLayout>
      <NomePagina
        titulo="Cadastrar Usuário"
        subtitulo="Adicionar um novo úsuario no clube Tamoios"
      ></NomePagina>
      <section
        style={{
          marginTop: "20px",
          marginBottom: "20px",
          display: "flex",
          gap: "20px",
          alignItems: "center",
          justifyContent: "space-around",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <AccountCircleIcon sx={{ fontSize: 200 }} />
          <Button
            variante="secundario"
            texto={"Adicionar Foto (Opcional)"}
            mensagemAlert={"Foto adicionada com sucesso !"}
          />
        </div>
        <div>
          <form action="">
            <label htmlFor="">Cargo:</label>
            <Select>
              <option value="">Selecione o cargo</option>
              <option value="1">Diretor</option>
              <option value="2">Secretário</option>
              <option value="3">Tesoureiro</option>
              <option value="4">Desbravador</option>
            </Select>
            <br />
            <label htmlFor="">Associar Desbravador</label>
            <Select>
              <option value="">Selecione o Desbravador</option>
              <option value="1">Ana Souza</option>
              <option value="2">Pedro Oliveira</option>
              <option value="3">Maria Santos</option>
              <option value="4">João Lima</option>
              <option value="5">Carlos Silva</option>
              <option value="6">Roberto Costa</option>
              <option value="7">Fernanda Alves</option>
              <option value="8">Marcos Pereira</option>
            </Select>
            <br />
            <label htmlFor="">Email:</label>
            <Input type="email" placeholder="Email" />
            <br />
            <div style={{ display: "flex", gap: "20px" }}>
              <div>
                <label htmlFor="">Senha:</label>
                <Input type="password" placeholder="Senha" />
              </div>
              <div>
                <label htmlFor="">Confirmar Senha:</label>
                <Input type="password" placeholder="Confirmar Senha" />
              </div>
            </div>
          </form>
        </div>
      </section>
      <Button
        texto={"Adicionar Usuário"}
        mensagemAlert={"Usuário cadastrado com sucesso !"}
        larguraTotal
      />
    </DashboardLayout>
  );
}
