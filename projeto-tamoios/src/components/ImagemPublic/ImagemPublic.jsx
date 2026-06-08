import styles from "../../styles/imagem-public.module.css";

export function ImagemPublic({ nomeImagem }) {
  const imgUrl = new URL(`../../assets/${nomeImagem}`, import.meta.url).href;

  return (
    <img
      className={styles.imagemPublic}
      src={imgUrl}
      alt={`Imagem ${nomeImagem}`}
    />
  );
}

export default ImagemPublic;
