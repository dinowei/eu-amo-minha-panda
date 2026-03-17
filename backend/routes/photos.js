const router  = require('express').Router();
const multer  = require('multer');
const path    = require('path');
const Photo   = require('../models/Photo');
const protect = require('../middleware/auth');

// Configuração do multer (salva em /uploads)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename:    (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase())
             && allowed.test(file.mimetype);
    ok ? cb(null, true) : cb(new Error('Somente imagens são permitidas'));
  }
});

// POST /api/photos  — upload
router.post('/', protect, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' });

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const photo = await Photo.create({
      uploader: req.user.id,
      url:      `${baseUrl}/uploads/${req.file.filename}`,
      caption:  req.body.caption || ''
    });

    await photo.populate('uploader', 'name');
    res.status(201).json(photo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/photos  — listar todas
router.get('/', protect, async (req, res) => {
  try {
    const photos = await Photo.find()
      .populate('uploader', 'name')
      .sort({ createdAt: -1 });
    res.json(photos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/photos/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) return res.status(404).json({ error: 'Foto não encontrada' });
    if (photo.uploader.toString() !== req.user.id)
      return res.status(403).json({ error: 'Sem permissão' });

    await photo.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
