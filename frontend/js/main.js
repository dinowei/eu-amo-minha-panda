import { requireAuth, getUser, logout, API_URL } from './auth.js';

const token = requireAuth();
const user  = getUser();

const navUser = document.getElementById('navUser');
if (navUser && user) navUser.textContent = `Olá, ${user.name} 👋`;
document.getElementById('btnLogout')?.addEventListener('click', logout);

// ── CURSOR PERSONALIZADO ─────────────────────
const cursor = document.getElementById('cursor');
document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top  = e.clientY + 'px';
});

// ── CONTADOR DE DIAS ─────────────────────────
// ⚠️ Troque pela data de início do relacionamento!
const INICIO = new Date('2022-07-02T00:00:00');

function atualizarContador() {
  const agora = new Date();
  const diff  = agora - INICIO;
  const dias  = Math.floor(diff / (1000 * 60 * 60 * 24));
  const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const min   = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  document.getElementById('cont-dias').textContent  = dias.toLocaleString('pt-BR');
  document.getElementById('cont-horas').textContent = String(horas).padStart(2, '0');
  document.getElementById('cont-min').textContent   = String(min).padStart(2, '0');
}

atualizarContador();
setInterval(atualizarContador, 60000);

// ── PARTÍCULAS ───────────────────────────────
const canvas = document.getElementById('particles');
const ctx    = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function criarParticula() {
  return {
    x:       Math.random() * canvas.width,
    y:       Math.random() * canvas.height,
    r:       Math.random() * 2 + 0.5,
    vx:      (Math.random() - 0.5) * 0.4,
    vy:      (Math.random() - 0.5) * 0.4,
    alpha:   Math.random() * 0.6 + 0.2
  };
}

for (let i = 0; i < 80; i++) particles.push(criarParticula());

function animarParticulas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(44,194,149,${p.alpha})`;
    ctx.fill();
  });
  requestAnimationFrame(animarParticulas);
}

animarParticulas();

// ── MÚSICA ───────────────────────────────────
const botao = document.getElementById('pandaPlay');
const icone = document.getElementById('playIcon');
const audio = document.getElementById('audio');

document.addEventListener('click', function iniciar() {
  audio?.play().catch(() => {});
  document.removeEventListener('click', iniciar);
}, { once: true });

function atualizarIcone() {
  icone.textContent = audio.paused ? '▶' : '⏸';
  audio.paused ? botao.classList.remove('playing') : botao.classList.add('playing');
}

botao?.addEventListener('click', e => {
  e.stopPropagation();
  audio.paused ? audio.play().catch(() => {}) : audio.pause();
});

audio?.addEventListener('play',  atualizarIcone);
audio?.addEventListener('pause', atualizarIcone);

// ── LIGHTBOX ─────────────────────────────────
const lightbox = document.getElementById('lightbox');
const lbImg    = document.getElementById('lb-img');
const lbClose  = document.getElementById('lb-close');
const lbPrev   = document.getElementById('lb-prev');
const lbNext   = document.getElementById('lb-next');

const cards = [...document.querySelectorAll('.foto-card[data-src]')];
let lbIndex = 0;

function abrirLightbox(index) {
  lbIndex = index;
  lbImg.src = cards[lbIndex].dataset.src;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function fecharLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

cards.forEach((card, i) => {
  card.addEventListener('click', () => abrirLightbox(i));
});

lbClose.addEventListener('click', fecharLightbox);

lbPrev.addEventListener('click', () => {
  lbIndex = (lbIndex - 1 + cards.length) % cards.length;
  lbImg.src = cards[lbIndex].dataset.src;
});

lbNext.addEventListener('click', () => {
  lbIndex = (lbIndex + 1) % cards.length;
  lbImg.src = cards[lbIndex].dataset.src;
});

document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape')      fecharLightbox();
  if (e.key === 'ArrowLeft')   lbPrev.click();
  if (e.key === 'ArrowRight')  lbNext.click();
});

lightbox.addEventListener('click', e => {
  if (e.target === lightbox) fecharLightbox();
});

// ── SCROLL REVEAL AVANÇADO ───────────────────────
// 1) Atribuir direções e delays a cada card na galeria
document.querySelectorAll('.mosaic-row').forEach((row) => {
  const cols = [...row.children];
  const total = cols.length;

  cols.forEach((col, i) => {
    const cards = col.classList.contains('foto-card')
      ? [col]
      : [...col.querySelectorAll('.foto-card')];

    cards.forEach((card, j) => {
      // Delay escalonado dentro de cada coluna
      card.style.setProperty('--delay', `${j * 0.13}s`);

      // Primeira coluna entra da esquerda, última da direita
      if (total > 1) {
        if (i === 0)         card.classList.add('from-left');
        if (i === total - 1) card.classList.add('from-right');
      }
    });
  });
});

// 2) Observer para cards individuais (reveal + shimmer)
const obsCards = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const card = e.target;
    card.classList.add('visible');

    // Dispara shimmer com leve delay extra para sincronizar com o reveal
    const delay = parseFloat(
      getComputedStyle(card).getPropertyValue('--delay') || '0'
    ) * 1000;
    setTimeout(() => card.classList.add('shimmer'), delay + 80);
    obsCards.unobserve(card);
  });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

// 3) Observer para separadores entre linhas
const obsRows = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('row-visible');
      obsRows.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => obsCards.observe(el));
document.querySelectorAll('.mosaic-row + .mosaic-row').forEach(el => obsRows.observe(el));

// 4) Aurora orb que percorre a galeria conforme o scroll
const galeria = document.getElementById('galeria');
if (galeria) {
  const orb = document.createElement('div');
  orb.className = 'galeria-orb';
  galeria.prepend(orb);

  const moveOrb = () => {
    const rect    = galeria.getBoundingClientRect();
    const visible = rect.height + window.innerHeight;
    const gone    = -rect.top;
    const pct     = Math.max(0, Math.min(1, gone / (visible - window.innerHeight)));
    orb.style.top = `${8 + pct * 82}%`;
  };

  window.addEventListener('scroll', moveOrb, { passive: true });
  moveOrb();
}

// ── BADGE CHAT ───────────────────────────────
async function checkUnread() {
  if (!token) return;
  try {
    const res  = await fetch(`${API_URL}/api/messages/unread`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    const badge = document.getElementById('chatBadge');
    if (badge && data.count > 0) {
      badge.textContent   = data.count;
      badge.style.display = 'flex';
    }
  } catch {}
}

checkUnread();
setInterval(checkUnread, 30000);
