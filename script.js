window.onload = function() {
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

  imagens.forEach((src, i) => {
    const img = document.createElement('img');
    img.src = src;
    img.className = 'foto-cascata';
    img.style.left = `${10 + i*8}vw`; // espalha as imagens na horizontal
    img.style.animationDelay = `${i*0.5}s`; // delay para cair em cascata
    document.body.appendChild(img);
  });
}
