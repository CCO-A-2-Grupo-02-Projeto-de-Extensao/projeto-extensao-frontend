import { useState } from "react";

export function Insignia({ src, alt, className }) {
  const [semImagem, setSemImagem] = useState(null);

  const mostrar = Boolean(src) && semImagem !== src;

  return (
    <div className={className}>
      {mostrar ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setSemImagem(src)}
        />
      ) : (
        <span>—</span>
      )}
    </div>
  );
}

export default Insignia;
