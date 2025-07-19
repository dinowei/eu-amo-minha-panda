function criarImagem() {
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
    const img = document.createElement('img');
    const escolha = imagens[Math.floor(Math.random() * imagens.length)];
    img.src = escolha;
    img.style.left = Math.random() * (window.innerWidth - 100) + 'px';
    img.style.top = '-100px';
    img.style.zIndex = Math.random() < 0.5 ? 0 : 2;
    document.body.appendChild(img);
    const velocidade = 1 + Math.random() * 2;

    function animate() {
        const y = parseFloat(img.style.top) || 0;
        if (y < window.innerHeight) {
            img.style.top = (y + velocidade) + 'px';
            requestAnimationFrame(animate);
        } else {
            img.remove();
        }
    }
    requestAnimationFrame(animate);
}

function iniciarQueda() {
    criarImagem();
    setTimeout(iniciarQueda, Math.random() * 1000 + 500);
}

window.onload = iniciarQueda;

document.getElementById('playBtn').addEventListener('click', function() {
    const audio = document.getElementById('audio');
    audio.play();
});
