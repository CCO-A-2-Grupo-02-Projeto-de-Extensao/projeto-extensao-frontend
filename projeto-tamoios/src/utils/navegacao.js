import HomeIcon from "@mui/icons-material/Home";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import DescriptionIcon from "@mui/icons-material/Description";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

export const itensNavegacao = [
  { texto: "Início", Icone: HomeIcon, path: "/dashboard" },
  { texto: "Desbravadores", Icone: PeopleAltIcon, path: "/dashboard/desbravadores" },
  { texto: "Cadastrar Usuário", Icone: PersonAddIcon, path: "/dashboard/cadastrar-usuario" },
  { texto: "Chamada", Icone: ContentPasteIcon, path: "/dashboard/chamada" },
  { texto: "Classes", Icone: MenuBookIcon, path: "/dashboard/classes" },
  { texto: "Especialidades", Icone: BookmarkIcon, path: "/dashboard/especialidades" },
  { texto: "Documentos", Icone: DescriptionIcon, path: "/dashboard/documentos" },
];
