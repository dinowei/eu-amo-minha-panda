// Função para criar uma imagem em queda
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
    img.style.left = Math.random() * (window.innerWidth - 100) + 'px'; // posição horizontal aleatória
    img.style.top = '-100px'; // inicia acima da tela
    // Atribuir z-index para ficar atrás ou à frente do texto
    img.style.zIndex = Math.random() < 0.5 ? 0 : 2;
    document.body.appendChild(img);
    const velocidade = 1 + Math.random() * 2; // velocidade aleatória

    function animate() {
        const y = parseFloat(img.style.top) || 0;
        if (y < window.innerHeight) {
            img.style.top = (y + velocidade) + 'px';
            requestAnimationFrame(animate);
        } else {
            img.remove(); // remove após sair da tela
        }
    }
    requestAnimationFrame(animate);
}

// Iniciar queda de imagens em intervalos aleatórios
function iniciarQueda() {
    criarImagem();
    setTimeout(iniciarQueda, Math.random() * 1000 + 500);
}

// Reproduzir música ao clicar no botão
document.getElementById('playBtn').addEventListener('click', function() {
    const audio = document.getElementById('audio');
    audio.play();
});

// Iniciar a queda após carregar a página
window.onload = iniciarQueda;
