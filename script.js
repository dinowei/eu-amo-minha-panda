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

function criarImagem() {
  const img = document.createElement('img');
  img.classList.add('falling');
  img.src = imagens[Math.floor(Math.random() * imagens.length)];
  img.style.left = Math.random() * (window.innerWidth - 80) + 'px';
  img.style.top = '-100px';

  // Duração da animação (mais longa = mais suave)
  const duracao = (Math.random() * 5 + 5).toFixed(2); // de 5 a 10 segundos
  img.style.animationDuration = `${duracao}s`;

  document.body.appendChild(img);

  img.addEventListener('animationend', () => {
    img.remove();
  });
}

function iniciarQueda() {
  criarImagem();
  setTimeout(iniciarQueda, Math.random() * 800 + 200); // 200ms a 1s
}

window.onload = () => {
  iniciarQueda();

  const botao = document.getElementById('pandaPlay');
  const audio = document.getElementById('audio');

  botao.addEventListener('click', () => {
    audio.paused ? audio.play() : audio.pause();
  });
};
