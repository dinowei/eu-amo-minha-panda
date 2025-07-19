// Array com caminhos das suas PNGs (10 imagens)
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

// Cria uma única imagem caindo
function criarImagem() {
  const img = document.createElement('img');
  img.src = imagens[Math.floor(Math.random() * imagens.length)];
  img.style.left = Math.random() * (window.innerWidth - 100) + 'px';
  img.style.top = '-100px';
  img.style.zIndex = Math.random() < 0.5 ? 0 : 0.5; // 0 atrás, 0.5 na frente
  document.body.appendChild(img);

  const velocidade = 1 + Math.random() * 2; // entre 1 e 3

  function animate() {
    let y = parseFloat(img.style.top);
    if (y < window.innerHeight) {
      img.style.top = (y + velocidade) + 'px';
      requestAnimationFrame(animate);
    } else {
      img.remove();
    }
  }
  requestAnimationFrame(animate);
}

// Loop infinito de criação de imagens
function iniciarQueda() {
  criarImagem();
  setTimeout(iniciarQueda, Math.random() * 1000 + 200);
}

// Quando a página carrega, dispara a queda
window.onload = iniciarQueda;

// Controla play/pause do áudio no clique
document.getElementById('pandaPlay').addEventListener('click', () => {
  const audio = document.getElementById('audio');
  audio.paused ? audio.play() : audio.pause();
});
