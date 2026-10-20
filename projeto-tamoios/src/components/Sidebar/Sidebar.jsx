import styles from "../../styles/sidebar.module.css";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import { useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import clubeTamoiosLogoImg from "../../assets/clube_tamoios_logo.webp";
import { itensNavegacao } from "../../utils/navegacao.js";
import LogoutIcon from "@mui/icons-material/Logout";
import { ConfirmacaoModal } from "../ConfirmacaoModal/ConfirmacaoModal.jsx";

const estiloItem = {
  cursor: "pointer",
  margin: "2px 12px",
  borderRadius: "12px",
  color: "#c4a8ab",
  "& .MuiListItemIcon-root": { minWidth: "36px", color: "inherit" },
  "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.08)", color: "#ffffff" },
  "&.Mui-selected, &.Mui-selected:hover": {
    backgroundColor: "transparent",
    color: "#ffffff",
  },
};

const negrito = { primary: { sx: { fontSize: "14px", fontWeight: 600 } } };

export function Sidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const lista = useRef(null);
  const indicador = useRef(null);
  const posicionado = useRef(false);
  const [confirmandoSaida, setConfirmandoSaida] = useState(false);

  useLayoutEffect(() => {
    const destaque = indicador.current;
    const ativo = lista.current?.querySelector(".Mui-selected");
    if (!destaque) return;
    if (!ativo) {
      destaque.style.opacity = "0";
      return;
    }
    if (!posicionado.current) destaque.style.transition = "none";
    destaque.style.height = `${ativo.offsetHeight}px`;
    destaque.style.transform = `translateY(${ativo.offsetTop}px)`;
    destaque.style.opacity = "1";
    if (!posicionado.current) {
      posicionado.current = true;
      requestAnimationFrame(() => {
        destaque.style.transition = "";
      });
    }
  }, [pathname]);

  const handleNavigate = (path) => {
    navigate(path);
  };

  // Limpa a sessão antes de sair: sem isto o token continua no localStorage e
  // basta voltar para /dashboard para entrar de novo.
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setConfirmandoSaida(false);
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
        <List ref={lista} className={styles.lista}>
          <span
            ref={indicador}
            className={styles.indicador}
            aria-hidden="true"
          />
          <ListItem style={{ justifyContent: "center", padding: "20px 0" }}>
            <span className={styles.logo}>
              <img src={clubeTamoiosLogoImg} alt="Logo do Clube Tamoios" />
            </span>
          </ListItem>
          {itensNavegacao.map(({ texto, Icone, path }) => (
            <ListItemButton
              key={path}
              className={styles.item}
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
          <ListItemButton
            className={`${styles.item} ${styles.sair}`}
            sx={estiloItem}
            onClick={() => setConfirmandoSaida(true)}
          >
            <ListItemIcon>
              <LogoutIcon className={styles.customIcon} />
            </ListItemIcon>
            <ListItemText primary="Sair" slotProps={negrito} />
          </ListItemButton>
        </List>
      </Drawer>

      <ConfirmacaoModal
        aberto={confirmandoSaida}
        titulo="Sair?"
        mensagem="Você volta para a tela de login e precisa entrar de novo para continuar."
        textoConfirmar="Sair"
        textoCancelar="Não"
        perigo
        onConfirmar={handleLogout}
        onCancelar={() => setConfirmandoSaida(false)}
      />
    </div>
  );
}

export default Sidebar;
