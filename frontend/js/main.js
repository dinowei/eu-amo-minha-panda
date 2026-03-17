import { requireAuth, getUser, logout, API_URL } from './auth.js';

// ── Auth guard ───────────────────────────────
const token = requireAuth();
const user  = getUser();

// Mostrar nome do usuário
const navUser = document.getElementById('navUser');
if (navUser && user) navUser.textContent = `Olá, ${user.name} 👋`;

document.getElementById('btnLogout')?.addEventListener('click', logout);

// ── Cascata de imagens ───────────────────────
const imagens = Array.from({length:10}, (_,i) => `imagens/img${i+1}.png`);

function criarImagem() {
  const img = document.createElement('img');
  img.classList.add('falling');
  img.src = imagens[Math.floor(Math.random() * imagens.length)];
  img.style.left = Math.random() * (window.innerWidth - 80) + 'px';
  const dur = (Math.random() * 5 + 5).toFixed(2);
  img.style.animationDuration = `${dur}s`;
  document.body.appendChild(img);
  img.addEventListener('animationend', () => img.remove());
}

function iniciarQueda() {
  criarImagem();
  setTimeout(iniciarQueda, Math.random() * 800 + 200);
}

// ── Música ───────────────────────────────────
const botao = document.getElementById('pandaPlay');
const audio = document.getElementById('audio');

audio?.play().catch(() => {});

botao?.addEventListener('click', () => {
  if (audio.paused) {
    audio.play().then(() => botao.classList.add('playing')).catch(() => {});
  } else {
    audio.pause();
    botao.classList.remove('playing');
  }
});

audio?.addEventListener('play',  () => botao?.classList.add('playing'));
audio?.addEventListener('pause', () => botao?.classList.remove('playing'));

// ── Scroll reveal ────────────────────────────
function setupReveal() {
  const els = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.12 });
  els.forEach(el => obs.observe(el));
}

// ── Badge de mensagens não lidas ─────────────
async function checkUnread() {
  if (!token) return;
  try {
    const res  = await fetch(`${API_URL}/api/messages/unread`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    const badge = document.getElementById('chatBadge');
    if (badge && data.count > 0) {
      badge.textContent  = data.count;
      badge.style.display = 'flex';
    }
  } catch {}
}

// ── Init ─────────────────────────────────────
iniciarQueda();
setupReveal();
checkUnread();
setInterval(checkUnread, 30000); // verifica a cada 30s
