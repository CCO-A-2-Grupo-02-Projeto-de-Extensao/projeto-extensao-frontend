import { useState } from "react";

import styles from "../../styles/insignia.module.css";

export function Insignia({ src, alt, className }) {
  const [carregada, setCarregada] = useState(null);
  const [semImagem, setSemImagem] = useState(null);

  const falhou = !src || semImagem === src;
  const carregando = !falhou && carregada !== src;

  return (
    <div className={className}>
      {!falhou && (
        <img
          src={src}
          alt={alt}
          hidden={carregando}
          onLoad={() => setCarregada(src)}
          onError={() => setSemImagem(src)}
        />
      )}

      {carregando && (
        <span
          className={styles.carregando}
          role="status"
          aria-label="Carregando insígnia"
        />
      )}

      {falhou && <span>—</span>}
    </div>
  );
}

export default Insignia;
