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
    <div className={styles.sidebar}>
      <Drawer variant="permanent" anchor="left">
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
              "&:hover": { backgroundColor: "action.hover" },
            }}
            button
            onClick={() => handleNavigate("/dashboard")}
          >
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Início" />
          </ListItem>
          <ListItem
            sx={{
              cursor: "pointer",
              "&:hover": { backgroundColor: "action.hover" },
            }}
            button
            onClick={() => handleNavigate("/dashboard/desbravadores")}
          >
            <ListItemIcon>
              <PeopleAltIcon />
            </ListItemIcon>
            <ListItemText primary="Desbravadores" />
          </ListItem>
          <ListItem
            sx={{
              cursor: "pointer",
              "&:hover": { backgroundColor: "action.hover" },
            }}
            button
            onClick={() => handleNavigate("/dashboard/cadastrar-usuario")}
          >
            <ListItemIcon>
              <PersonAddIcon />
            </ListItemIcon>
            <ListItemText primary="Cadastrar Usuário" />
          </ListItem>
          <ListItem
            sx={{
              cursor: "pointer",
              "&:hover": { backgroundColor: "action.hover" },
            }}
            button
            onClick={() => handleNavigate("/dashboard/chamada")}
          >
            <ListItemIcon>
              <ContentPasteIcon />
            </ListItemIcon>
            <ListItemText primary="Chamada" />
          </ListItem>
          <ListItem
            sx={{
              cursor: "pointer",
              "&:hover": { backgroundColor: "action.hover" },
            }}
            button
            onClick={() => handleNavigate("/dashboard/classe")}
          >
            <ListItemIcon>
              <MenuBookIcon />
            </ListItemIcon>
            <ListItemText primary="Classes" />
          </ListItem>
          <ListItem
            sx={{
              cursor: "pointer",
              "&:hover": { backgroundColor: "action.hover" },
            }}
            button
            onClick={() => handleNavigate("/dashboard/especialidades")}
          >
            <ListItemIcon>
              <BookmarkIcon />
            </ListItemIcon>
            <ListItemText primary="Especialidades" />
          </ListItem>
          <ListItem
            sx={{
              cursor: "pointer",
              "&:hover": { backgroundColor: "action.hover" },
            }}
            button
            onClick={() => handleNavigate("/dashboard/documentos")}
          >
            <ListItemIcon>
              <DescriptionIcon />
            </ListItemIcon>
            <ListItemText primary="Documentos" />
          </ListItem>
          <ListItem
            sx={{
              cursor: "pointer",
              "&:hover": { backgroundColor: "action.hover" },
            }}
            button
            onClick={() => handleNavigate("/")}
          >
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Sair" />
          </ListItem>
        </List>
      </Drawer>
    </div>
  );
}

export default Sidebar;
