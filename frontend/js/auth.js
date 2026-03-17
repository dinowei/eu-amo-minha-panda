// ⚠️ Troque pela URL do Render após o deploy
export const API_URL = 'http://localhost:3001';

export function requireAuth() {
  const token = localStorage.getItem('token');
  if (!token) { window.location.href = 'login.html'; return null; }
  return token;
}

export function getUser() {
  const u = localStorage.getItem('user');
  return u ? JSON.parse(u) : null;
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

// ── Lógica da tela de login ──────────────────
const btnLogin   = document.getElementById('btnLogin');
const emailInput = document.getElementById('email');
const passInput  = document.getElementById('password');
const errorMsg   = document.getElementById('errorMsg');

if (btnLogin) {
  if (localStorage.getItem('token')) window.location.href = 'index.html';

  function showError(msg) {
    errorMsg.textContent   = msg;
    errorMsg.style.display = 'block';
  }

  async function doLogin() {
    const email    = emailInput.value.trim();
    const password = passInput.value;
    if (!email || !password) return showError('Preencha email e senha.');

    btnLogin.disabled    = true;
    btnLogin.textContent = 'Entrando...';
    errorMsg.style.display = 'none';

    try {
      const res  = await fetch(`${API_URL}/api/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        showError(data.error || 'Erro ao fazer login.');
      } else {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user',  JSON.stringify(data.user));
        window.location.href = 'index.html';
      }
    } catch {
      showError('Não foi possível conectar ao servidor.');
    } finally {
      btnLogin.disabled    = false;
      btnLogin.textContent = 'Entrar 💚';
    }
  }

  btnLogin.addEventListener('click', doLogin);
  [emailInput, passInput].forEach(el =>
    el.addEventListener('keydown', e => e.key === 'Enter' && doLogin())
  );
}
