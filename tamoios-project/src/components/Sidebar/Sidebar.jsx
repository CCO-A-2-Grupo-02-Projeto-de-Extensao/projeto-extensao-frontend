import { Drawer, List, ListItem, ListItemText } from "@mui/material";
import desbravadoresLogoImg from "../../assets/desbravadores_logo.png";

export function Sidebar() {
  return (
    <div>
      <Drawer variant="permanent" anchor="left">
        <List>
          <ListItem button>
            <img
              src={desbravadoresLogoImg}
              className="base"
              alt="Logo dos Desbravadores"
              style={{ width: "90px", height: "auto" }}
            />
          </ListItem>
          <ListItem button>
            <ListItemText primary="Início" />
          </ListItem>
          <ListItem button>
            <ListItemText primary="Desbravadores" />
          </ListItem>
          <ListItem button>
            <ListItemText primary="Chamada" />
          </ListItem>
          <ListItem button>
            <ListItemText primary="Classes" />
          </ListItem>
          <ListItem button>
            <ListItemText primary="Especialidades" />
          </ListItem>
          <ListItem button>
            <ListItemText primary="Documentos" />
          </ListItem>
          <ListItem button>
            <ListItemText primary="Sair" />
          </ListItem>
        </List>
      </Drawer>
    </div>
  );
}

export default Sidebar;
