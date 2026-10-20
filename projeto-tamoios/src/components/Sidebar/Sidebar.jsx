import styles from "../../styles/sidebar.module.css";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import clubeTamoiosLogoImg from "../../assets/clube_tamoios_logo.webp";
import { itensNavegacao } from "../../utils/navegacao.js";
import LogoutIcon from "@mui/icons-material/Logout";

const estiloItem = {
  cursor: "pointer",
  margin: "2px 12px",
  borderRadius: "12px",
  color: "#c4a8ab",
  "& .MuiListItemIcon-root": { minWidth: "36px", color: "inherit" },
  "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.08)", color: "#ffffff" },
  "&.Mui-selected, &.Mui-selected:hover": {
    backgroundColor: "var(--vinhoVivo)",
    color: "#ffffff",
  },
};

const negrito = { primary: { sx: { fontSize: "14px", fontWeight: 600 } } };

export function Sidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

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
      style={{ backgroundColor: "var(--vinhoProfundo)" }}
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
              src={clubeTamoiosLogoImg}
              className="base"
              alt="Logo do Clube Tamoios"
              style={{ width: "120px", height: "120px", borderRadius: "50%" }}
            />
          </ListItem>
          {itensNavegacao.map(({ texto, Icone, path }) => (
            <ListItemButton
              key={path}
              sx={estiloItem}
              selected={
                path === "/dashboard"
                  ? pathname === path
                  : pathname.startsWith(path)
              }
              onClick={() => handleNavigate(path)}
            >
              <ListItemIcon>
                <Icone className={styles.customIcon} />
              </ListItemIcon>
              <ListItemText primary={texto} slotProps={negrito} />
            </ListItemButton>
          ))}
        </List>
        <List className={styles.rodape}>
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
