import styles from "../../styles/sidebar.module.css";
import {
  Drawer,
  List,
  ListItem,
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

export function Sidebar() {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
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
          <ListItem
            sx={{
              cursor: "pointer",
              "&:hover": { backgroundColor: "var(--vermelho)" },
            }}
            button
            onClick={() => handleNavigate("/dashboard")}
          >
            <ListItemIcon>
              <HomeIcon className={styles.customIcon} />
            </ListItemIcon>
            <ListItemText
              primary="Início"
              primaryTypographyProps={{ sx: { fontWeight: "bold" } }}
            />
          </ListItem>
          <ListItem
            sx={{
              cursor: "pointer",
              "&:hover": { backgroundColor: "var(--vermelho)" },
            }}
            button
            onClick={() => handleNavigate("/dashboard/desbravadores")}
          >
            <ListItemIcon>
              <PeopleAltIcon className={styles.customIcon} />
            </ListItemIcon>
            <ListItemText
              primary="Desbravadores"
              primaryTypographyProps={{ sx: { fontWeight: "bold" } }}
            />
          </ListItem>
          <ListItem
            sx={{
              cursor: "pointer",
              "&:hover": { backgroundColor: "var(--vermelho)" },
            }}
            button
            onClick={() => handleNavigate("/dashboard/cadastrar-usuario")}
          >
            <ListItemIcon>
              <PersonAddIcon className={styles.customIcon} />
            </ListItemIcon>
            <ListItemText
              primary="Cadastrar Usuário"
              primaryTypographyProps={{ sx: { fontWeight: "bold" } }}
            />
          </ListItem>
          <ListItem
            sx={{
              cursor: "pointer",
              "&:hover": { backgroundColor: "var(--vermelho)" },
            }}
            button
            onClick={() => handleNavigate("/dashboard/chamada")}
          >
            <ListItemIcon>
              <ContentPasteIcon className={styles.customIcon} />
            </ListItemIcon>
            <ListItemText
              primary="Chamada"
              primaryTypographyProps={{ sx: { fontWeight: "bold" } }}
            />
          </ListItem>
          <ListItem
            sx={{
              cursor: "pointer",
              "&:hover": { backgroundColor: "var(--vermelho)" },
            }}
            button
            onClick={() => handleNavigate("/dashboard/classes")}
          >
            <ListItemIcon>
              <MenuBookIcon className={styles.customIcon} />
            </ListItemIcon>
            <ListItemText
              primary="Classes"
              primaryTypographyProps={{ sx: { fontWeight: "bold" } }}
            />
          </ListItem>
          <ListItem
            sx={{
              cursor: "pointer",
              "&:hover": { backgroundColor: "var(--vermelho)" },
            }}
            button
            onClick={() => handleNavigate("/dashboard/especialidades")}
          >
            <ListItemIcon>
              <BookmarkIcon className={styles.customIcon} />
            </ListItemIcon>
            <ListItemText
              primary="Especialidades"
              primaryTypographyProps={{ sx: { fontWeight: "bold" } }}
            />
          </ListItem>
          <ListItem
            sx={{
              cursor: "pointer",
              "&:hover": { backgroundColor: "var(--vermelho)" },
            }}
            button
            onClick={() => handleNavigate("/dashboard/documentos")}
          >
            <ListItemIcon>
              <DescriptionIcon className={styles.customIcon} />
            </ListItemIcon>
            <ListItemText
              primary="Documentos"
              primaryTypographyProps={{ sx: { fontWeight: "bold" } }}
            />
          </ListItem>
          <ListItem
            sx={{
              cursor: "pointer",
              "&:hover": { backgroundColor: "var(--vermelho)" },
            }}
            button
            onClick={() => handleNavigate("/")}
          >
            <ListItemIcon>
              <LogoutIcon className={styles.customIcon} />
            </ListItemIcon>
            <ListItemText
              primary="Sair"
              primaryTypographyProps={{ sx: { fontWeight: "bold" } }}
            />
          </ListItem>
        </List>
      </Drawer>
    </div>
  );
}

export default Sidebar;
