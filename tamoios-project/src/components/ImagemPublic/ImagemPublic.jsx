export function ImagemPublic({ nomeImagem }) {
  return <img src={`/src/assets/${nomeImagem}`} alt={`Imagem ${nomeImagem}`} />;
}
export default ImagemPublic;
