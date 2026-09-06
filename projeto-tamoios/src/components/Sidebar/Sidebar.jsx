import styles from "../../styles/sidebar.module.css";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import desbravadoresLogoImg from "../../assets/desbravadores_logo.png";
import HomeIcon from "@mui/icons-material/Home";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import LogoutIcon from "@mui/icons-material/Logout";
import DescriptionIcon from "@mui/icons-material/Description";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

const itensNavegacao = [
  { texto: "Início", Icone: HomeIcon, path: "/dashboard" },
  { texto: "Desbravadores", Icone: PeopleAltIcon, path: "/dashboard/desbravadores" },
  { texto: "Cadastrar Usuário", Icone: PersonAddIcon, path: "/dashboard/cadastrar-usuario" },
  { texto: "Chamada", Icone: ContentPasteIcon, path: "/dashboard/chamada" },
  { texto: "Classes", Icone: MenuBookIcon, path: "/dashboard/classes" },
  { texto: "Especialidades", Icone: BookmarkIcon, path: "/dashboard/especialidades" },
  { texto: "Documentos", Icone: DescriptionIcon, path: "/dashboard/documentos" },
];

const estiloItem = {
  cursor: "pointer",
  "&:hover": { backgroundColor: "var(--vermelho)" },
};

const negrito = { primary: { sx: { fontWeight: "bold" } } };

export function Sidebar() {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  // Limpa a sessão antes de sair: sem isto o token continua no localStorage e
  // basta voltar para /dashboard para entrar de novo.
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/", { replace: true });
  };

  return (
    <div
      className={styles.sidebar}
      style={{ backgroundColor: "var(--vinhoEscuro)" }}
    >
      <Drawer
        variant="permanent"
        anchor="left"
        slotProps={{
          paper: {
            className: styles.customDrawerPaper,
          },
        }}
      >
        <List>
          <ListItem style={{ justifyContent: "center", padding: "20px 0" }}>
            <img
              src={desbravadoresLogoImg}
              className="base"
              alt="Logo dos Desbravadores"
              style={{ width: "90px", height: "auto" }}
            />
          </ListItem>
          {itensNavegacao.map(({ texto, Icone, path }) => (
            <ListItemButton
              key={path}
              sx={estiloItem}
              onClick={() => handleNavigate(path)}
            >
              <ListItemIcon>
                <Icone className={styles.customIcon} />
              </ListItemIcon>
              <ListItemText primary={texto} slotProps={negrito} />
            </ListItemButton>
          ))}
          <ListItemButton sx={estiloItem} onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon className={styles.customIcon} />
            </ListItemIcon>
            <ListItemText primary="Sair" slotProps={negrito} />
          </ListItemButton>
        </List>
      </Drawer>
    </div>
  );
}

export default Sidebar;
