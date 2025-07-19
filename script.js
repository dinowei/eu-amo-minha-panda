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

  // Tentar tocar automaticamente (pode ser bloqueado pelo navegador)
  audio.play().catch(e => {
    console.log('Autoplay bloqueado pelo navegador. Clique no panda para tocar a música!');
  });

  botao.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().then(() => {
        console.log('🎵 Música tocando!');
        botao.classList.add('playing');
      }).catch(e => {
        console.log('❌ Erro ao tocar música:', e);
        alert('Erro ao reproduzir música. Verifique se o arquivo existe.');
      });
    } else {
      audio.pause();
      console.log('⏸️ Música pausada!');
      botao.classList.remove('playing');
    }
  });

  // Feedback visual quando a música está tocando
  audio.addEventListener('play', () => {
    botao.classList.add('playing');
    console.log('🎶 Áudio iniciado!');
  });

  audio.addEventListener('pause', () => {
    botao.classList.remove('playing');
    console.log('⏹️ Áudio pausado!');
  });

  // Verificar se o áudio carregou corretamente
  audio.addEventListener('loadeddata', () => {
    console.log('✅ Áudio carregado com sucesso!');
  });

  audio.addEventListener('error', (e) => {
    console.log('❌ Erro ao carregar áudio:', e);
  });
};
