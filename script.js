// Lista de PNGs para a "chuva"
const imagens = [
  'imagens/img1.png',
  'imagens/img2.png',
  'imagens/img3.png',
  'imagens/img4.png',
  'imagens/img5.png',
  'imagens/img6.png',
  'imagens/img7.png',
  'imagens/img8.png',
  'imagens/img9.png',
  'imagens/img10.png'
];

// Cria e anima uma imagem caindo
function criarImagem() {
  const img = document.createElement('img');
  img.src = imagens[Math.floor(Math.random() * imagens.length)];
  img.style.position = 'absolute';
  img.style.top      = '-100px';
  img.style.left     = Math.random() * (window.innerWidth - 80) + 'px';
  // duração fixa no CSS (14s), mas se quiser variar:
  // const dur = (Math.random() * 6 + 12).toFixed(2);
  // img.style.animationDuration = `${dur}s`;
  document.body.appendChild(img);
  img.addEventListener('animationend', () => img.remove());
}

// Inicia a chuva em loop infinito, a cada 1–2s
function iniciarQueda() {
  criarImagem();
  setTimeout(iniciarQueda, Math.random() * 1000 + 1000);
}

// Liga tudo quando a página carrega
window.onload = () => {
  iniciarQueda();
  document.getElementById('pandaPlay').addEventListener('click', () => {
    const audio = document.getElementById('audio');
    audio.paused ? audio.play() : audio.pause();
  });
};
