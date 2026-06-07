import styles from "../../styles/imagem-public.module.css";

export function ImagemPublic({ nomeImagem }) {
  return (
    <img
      className={styles.imagemPublic}
      src={`/src/assets/${nomeImagem}`}
      alt={`Imagem ${nomeImagem}`}
    />
  );
}
export default ImagemPublic;
