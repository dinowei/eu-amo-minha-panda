import { requireAuth, getUser, logout, API_URL } from './auth.js';

const token = requireAuth();
const user  = getUser();

document.getElementById('btnLogoutChat')?.addEventListener('click', logout);

const msgList   = document.getElementById('messageList');
const msgInput  = document.getElementById('msgInput');
const sendBtn   = document.getElementById('sendBtn');
const typingEl  = document.getElementById('typingIndicator');

// ── Socket.io ────────────────────────────────
const SOCKET_URL = API_URL;
const socket = io(SOCKET_URL, { auth: { token } });

socket.on('connect', () => console.log('🟢 Socket conectado'));
socket.on('connect_error', (e) => console.error('Socket erro:', e.message));

// ── Carregar histórico ───────────────────────
async function loadHistory() {
  try {
    const res  = await fetch(`${API_URL}/api/messages`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const msgs = await res.json();

    if (msgs.length === 0) {
      msgList.innerHTML = `
        <div class="empty-chat">
          <span>🐼</span>
          <p>Nenhuma mensagem ainda.<br>Diz oi! 💚</p>
        </div>`;
      return;
    }

    msgs.forEach(m => renderMessage(m, false));
    scrollBottom();

    // Marcar como lidas
    await fetch(`${API_URL}/api/messages/read-all`, {
      method:  'PUT',
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (err) {
    console.error('Erro ao carregar histórico:', err);
  }
}

// ── Renderizar mensagem ──────────────────────
let lastDate = '';

function renderMessage(msg, animate = true) {
  // Remove estado vazio
  document.querySelector('.empty-chat')?.remove();

  const isMine  = msg.sender._id === user?.id || msg.sender === user?.id;
  const dateStr = new Date(msg.createdAt).toLocaleDateString('pt-BR');
  const timeStr = new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' });

  // Separador de data
  if (dateStr !== lastDate) {
    lastDate = dateStr;
    const sep = document.createElement('div');
    sep.className   = 'date-separator';
    sep.textContent = dateStr === new Date().toLocaleDateString('pt-BR') ? 'Hoje' : dateStr;
    msgList.appendChild(sep);
  }

  const bubble = document.createElement('div');
  bubble.classList.add('msg-bubble', isMine ? 'msg-mine' : 'msg-other');
  if (!animate) bubble.style.animation = 'none';

  const senderName = msg.sender.name || (isMine ? user.name : 'Panda');

  bubble.innerHTML = `
    ${!isMine ? `<div class="msg-name">${senderName}</div>` : ''}
    <div class="msg-text">${escapeHtml(msg.content)}</div>
    <div class="msg-meta">
      <span>${timeStr}</span>
      ${isMine ? `<span>${msg.read ? '✓✓' : '✓'}</span>` : ''}
    </div>
  `;

  msgList.appendChild(bubble);
  if (animate) scrollBottom();
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');
}

function scrollBottom() {
  msgList.scrollTop = msgList.scrollHeight;
}

// ── Receber mensagens em tempo real ─────────
socket.on('receive_message', (msg) => {
  renderMessage(msg, true);

  // Marca como lida se a janela está ativa
  if (!document.hidden) {
    fetch(`${API_URL}/api/messages/read-all`, {
      method:  'PUT',
      headers: { Authorization: `Bearer ${token}` }
    });
  }
});

// ── Indicador "digitando..." ─────────────────
let typingTimer;

socket.on('user_typing', ({ name, isTyping }) => {
  if (isTyping) {
    typingEl.textContent  = `${name} está digitando...`;
    typingEl.style.display = 'inline';
  } else {
    typingEl.style.display = 'none';
  }
});

msgInput.addEventListener('input', () => {
  // Auto-resize
  msgInput.style.height = 'auto';
  msgInput.style.height = Math.min(msgInput.scrollHeight, 120) + 'px';

  // Emite typing
  socket.emit('typing', true);
  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => socket.emit('typing', false), 1500);
});

// ── Enviar mensagem ──────────────────────────
function sendMessage() {
  const content = msgInput.value.trim();
  if (!content) return;

  socket.emit('send_message', { content });
  msgInput.value  = '';
  msgInput.style.height = 'auto';
  sendBtn.disabled = false;
  socket.emit('typing', false);
  clearTimeout(typingTimer);
}

sendBtn.addEventListener('click', sendMessage);

msgInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// ── Init ─────────────────────────────────────
loadHistory();
