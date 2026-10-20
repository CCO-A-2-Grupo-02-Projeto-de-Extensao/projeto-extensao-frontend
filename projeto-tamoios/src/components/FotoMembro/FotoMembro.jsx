import { useEffect, useState } from "react";
import { Avatar } from "../Avatar/Avatar.jsx";
import { FotoEnquadrada } from "../FotoEnquadrada/FotoEnquadrada.jsx";
import { urlLocalDoDocumento } from "../../services/documentosService.js";

export function FotoMembro({ membro, documento, tamanho = 32 }) {
  const [foto, setFoto] = useState({ id: null, url: null });
  const idDocumento = documento?.idDocumento ?? null;

  useEffect(() => {
    if (!idDocumento) return undefined;
    let ativo = true;
    let url = null;

    urlLocalDoDocumento(idDocumento)
      .then((local) => {
        url = local;
        if (ativo) setFoto({ id: idDocumento, url: local });
        else URL.revokeObjectURL(local);
      })
      .catch(() => {});

    return () => {
      ativo = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [idDocumento]);

  if (!idDocumento || foto.id !== idDocumento) {
    return (
      <Avatar nome={membro.nome} tamanho={tamanho} inativo={!membro.ativo} />
    );
  }

  return (
    <FotoEnquadrada
      url={foto.url}
      alt={`Foto de ${membro.nome}`}
      enquadramento={documento}
      tamanho={tamanho}
    />
  );
}

export default FotoMembro;
