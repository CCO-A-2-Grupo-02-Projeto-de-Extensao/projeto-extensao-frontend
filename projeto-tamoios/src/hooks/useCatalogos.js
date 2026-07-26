import { useEffect, useState } from "react";
import { getCargos, getClasses, getGeneros, getUnidades } from "../services/catalogosService.js";

// Carrega uma vez os catálogos de referência (Cargo, Classe, Gênero,
// Unidade) usados pelos dropdowns do formulário de cadastro/edição.
export function useCatalogos() {
  const [catalogos, setCatalogos] = useState({
    cargos: [],
    classes: [],
    generos: [],
    unidades: [],
  });
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    Promise.all([getCargos(), getClasses(), getGeneros(), getUnidades()])
      .then(([cargos, classes, generos, unidades]) => {
        if (ativo) {
          setCatalogos({ cargos, classes, generos, unidades });
          setCarregando(false);
        }
      })
      .catch(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  return { ...catalogos, carregandoCatalogos: carregando };
}

export default useCatalogos;
