import styles from "../../styles/imagem-public.module.css";

export function ImagemPublic({ nomeImagem }) {
  return (
    <img
      className={styles.imagemPublic}
      src={`/${nomeImagem}`}
      alt={`Imagem ${nomeImagem}`}
    />
  );
}
export default ImagemPublic;
