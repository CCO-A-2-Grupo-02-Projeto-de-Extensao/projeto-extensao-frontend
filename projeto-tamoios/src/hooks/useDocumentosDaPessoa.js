import { useEffect, useState } from "react";
import { listarDocumentosDaPessoa } from "../services/documentosService.js";

export function useDocumentosDaPessoa(idPessoa) {
  const [resultado, setResultado] = useState({ id: null, documentos: null });

  useEffect(() => {
    let ativo = true;
    listarDocumentosDaPessoa(idPessoa)
      .then((documentos) => {
        if (ativo) setResultado({ id: idPessoa, documentos });
      })
      .catch(() => {
        if (ativo) setResultado({ id: idPessoa, documentos: null });
      });
    return () => {
      ativo = false;
    };
  }, [idPessoa]);

  return resultado.id === idPessoa ? resultado.documentos : null;
}

export default useDocumentosDaPessoa;
