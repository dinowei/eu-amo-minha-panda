// Função para criar uma imagem em queda
function criarImagem() {
    const imagens = ['img1.png', 'img2.png', 'img3.png']; // nomes dos arquivos PNG (ajuste conforme suas imagens)
    const img = document.createElement('img');
    const escolha = imagens[Math.floor(Math.random() * imagens.length)];
    img.src = escolha;
    img.style.left = Math.random() * (window.innerWidth - 100) + 'px'; // posição horizontal aleatória
    img.style.top = '-100px'; // inicia acima da tela
    // Atribuir z-index para ficar atrás ou à frente do texto
    if (Math.random() < 0.5) {
        img.style.zIndex = 0;
    } else {
        img.style.zIndex = 2;
    }
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
