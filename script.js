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
   function criarImagem() {
-  const img = document.createElement('img');
+  const img = document.createElement('img');

+  // **FORÇA a imagem a usar posicionamento absoluto e começar fora da tela**
+  img.style.position = 'absolute';
+  img.style.top      = '-100px';

   img.src = imagens[Math.floor(Math.random() * imagens.length)];
   // posição horizontal aleatória:
   img.style.left = Math.random() * (window.innerWidth - 80) + 'px';
   // duração aleatória entre 6 e 9 segundos:
   const duracao = (Math.random() * 5 + 10).toFixed(2);
   img.style.animationDuration = `${duracao}s`;
   // envio pro DOM
   document.body.appendChild(img);
   // quando acabar a animação, remove o elemento:
   img.addEventListener('animationend', () => img.remove());
 }

  img.src = imagens[Math.floor(Math.random() * imagens.length)];
  // posição horizontal aleatória:
  img.style.left = Math.random() * (window.innerWidth - 80) + 'px';
  // duração aleatória entre 4 e 7 segundos:
  const duracao = (Math.random() * 3 + 4).toFixed(2);
  img.style.animationDuration = `${duracao}s`;
  // envio pro DOM
  document.body.appendChild(img);
  // quando acabar a animação, remove o elemento:
  img.addEventListener('animationend', () => img.remove());
}

// gera imagens indefinidamente, a cada 300–800ms:
function iniciarQueda() {
  criarImagem();
  setTimeout(iniciarQueda, Math.random() * 500 + 300);
}

window.onload = () => {
  iniciarQueda();
  // play/pause no clique do botão panda
  document.getElementById('pandaPlay').addEventListener('click', () => {
    const audio = document.getElementById('audio');
    audio.paused ? audio.play() : audio.pause();
  });
};
