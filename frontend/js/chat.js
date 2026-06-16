import { requireAuth, getUser, logout, API_URL } from './auth.js';

const token = requireAuth();
const user = getUser();

document.getElementById('btnLogoutChat')?.addEventListener('click', logout);

const msgList = document.getElementById('messageList');
const msgInput = document.getElementById('msgInput');
const sendBtn = document.getElementById('sendBtn');
const typingEl = document.getElementById('typingIndicator');

const SOCKET_URL = API_URL;
const socket = io(SOCKET_URL, { auth: { token } });

socket.on('connect', () => console.log('Socket conectado'));
socket.on('connect_error', (e) => console.error('Socket erro:', e.message));

async function loadHistory() {
  try {
    const res = await fetch(`${API_URL}/api/messages`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const msgs = await res.json();

    if (msgs.length === 0) {
      msgList.innerHTML = `
        <div class="empty-chat">
          <span>&#128060;</span>
          <p>Nenhuma mensagem ainda.<br>Diz oi! &#128154;</p>
        </div>`;
      return;
    }

    msgs.forEach(m => renderMessage(m, false));
    scrollBottom();

    await fetch(`${API_URL}/api/messages/read-all`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (err) {
    console.error('Erro ao carregar historico:', err);
  }
}

let lastDate = '';

function getSenderId(msg) {
  return String(msg.sender?._id || msg.sender || '');
}

function renderMessage(msg, animate = true) {
  document.querySelector('.empty-chat')?.remove();

  const senderId = getSenderId(msg);
  const isMine = senderId === user?.id;
  const dateStr = new Date(msg.createdAt).toLocaleDateString('pt-BR');
  const timeStr = new Date(msg.createdAt).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  if (dateStr !== lastDate) {
    lastDate = dateStr;
    const sep = document.createElement('div');
    sep.className = 'date-separator';
    sep.textContent = dateStr === new Date().toLocaleDateString('pt-BR') ? 'Hoje' : dateStr;
    msgList.appendChild(sep);
  }

  const previousBubble = [...msgList.children]
    .reverse()
    .find(el => el.classList?.contains('msg-bubble'));
  const isGrouped = previousBubble?.dataset.senderId === senderId;

  const bubble = document.createElement('div');
  bubble.classList.add('msg-bubble', isMine ? 'msg-mine' : 'msg-other');
  if (isGrouped) bubble.classList.add('msg-grouped');
  if (!animate) bubble.style.animation = 'none';
  bubble.dataset.senderId = senderId;

  const senderName = msg.sender?.name || (isMine ? user?.name : 'Panda');

  bubble.innerHTML = `
    ${!isMine && !isGrouped ? `<div class="msg-name">${senderName}</div>` : ''}
    <div class="msg-text">${escapeHtml(msg.content)}</div>
    <div class="msg-meta">
      <span>${timeStr}</span>
      ${isMine ? `<span class="msg-status ${msg.read ? 'read' : 'sent'}">${msg.read ? '✓✓' : '✓'}</span>` : ''}
    </div>
  `;

  msgList.appendChild(bubble);
  if (animate) scrollBottom();
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');
}

function scrollBottom() {
  msgList.scrollTop = msgList.scrollHeight;
}

socket.on('receive_message', (msg) => {
  renderMessage(msg, true);

  if (!document.hidden) {
    fetch(`${API_URL}/api/messages/read-all`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    });
  }
});

let typingTimer;

socket.on('user_typing', ({ isTyping }) => {
  typingEl.style.display = isTyping ? 'inline-flex' : 'none';
});

msgInput.addEventListener('input', () => {
  msgInput.style.height = 'auto';
  msgInput.style.height = Math.min(msgInput.scrollHeight, 120) + 'px';

  socket.emit('typing', true);
  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => socket.emit('typing', false), 1500);
});

function sendMessage() {
  const content = msgInput.value.trim();
  if (!content) return;

  socket.emit('send_message', { content });
  msgInput.value = '';
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

loadHistory();
