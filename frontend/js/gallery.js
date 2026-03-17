import { requireAuth, getUser, API_URL } from './auth.js';

const token = requireAuth();
const user  = getUser();
const grid  = document.getElementById('fotoGrid');

// ── Carregar fotos da API ────────────────────
async function loadPhotos() {
  try {
    const res    = await fetch(`${API_URL}/api/photos`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const photos = await res.json();

    // Remove cards antigos (mantém o de upload)
    document.querySelectorAll('.foto-card').forEach(el => el.remove());

    photos.forEach(photo => addPhotoCard(photo));
  } catch (err) {
    console.error('Erro ao carregar fotos:', err);
  }
}

// ── Criar card de foto ───────────────────────
function addPhotoCard(photo) {
  const uploadCard = document.getElementById('uploadCard');
  const card = document.createElement('div');
  card.classList.add('foto-card', 'reveal');
  card.dataset.id = photo._id;

  card.innerHTML = `
    <img src="${photo.url}" alt="${photo.caption || 'Memória'}">
    <div class="foto-overlay">💚</div>
    ${photo.uploader?._id === user?.id
      ? `<button class="foto-delete" title="Excluir">✕</button>`
      : ''}
  `;

  // Botão excluir
  card.querySelector('.foto-delete')?.addEventListener('click', async (e) => {
    e.stopPropagation();
    if (!confirm('Excluir esta foto?')) return;
    try {
      await fetch(`${API_URL}/api/photos/${photo._id}`, {
        method:  'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      card.remove();
    } catch { alert('Erro ao excluir.'); }
  });

  // Inserir ANTES do card de upload
  grid.insertBefore(card, uploadCard);

  // Trigger reveal
  requestAnimationFrame(() => card.classList.add('visible'));
}

// ── Upload de foto ───────────────────────────
const fileInput = document.getElementById('fileInput');

fileInput?.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const uploadCard = document.getElementById('uploadCard');
  uploadCard.style.opacity = '0.5';
  uploadCard.style.pointerEvents = 'none';

  const formData = new FormData();
  formData.append('photo', file);

  try {
    const res   = await fetch(`${API_URL}/api/photos`, {
      method:  'POST',
      headers: { Authorization: `Bearer ${token}` },
      body:    formData
    });
    const photo = await res.json();
    if (res.ok) addPhotoCard(photo);
    else alert(photo.error || 'Erro ao enviar foto.');
  } catch {
    alert('Erro de conexão.');
  } finally {
    uploadCard.style.opacity = '1';
    uploadCard.style.pointerEvents = 'auto';
    fileInput.value = '';
  }
});

// ── Init ─────────────────────────────────────
loadPhotos();
