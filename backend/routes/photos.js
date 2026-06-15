const fs = require('fs');
const path = require('path');
const router = require('express').Router();
const multer = require('multer');
const sharp = require('sharp');
const Photo = require('../models/Photo');
const protect = require('../middleware/auth');

const uploadsDir = path.resolve('uploads');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase())
      && allowed.test(file.mimetype);

    ok ? cb(null, true) : cb(new Error('Somente imagens sao permitidas'));
  }
});

router.post('/', protect, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' });

    fs.mkdirSync(uploadsDir, { recursive: true });

    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
    const outputPath = path.join(uploadsDir, filename);

    await sharp(req.file.buffer)
      .rotate()
      .resize({
        width: 1920,
        height: 1920,
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: 82 })
      .toFile(outputPath);

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const photo = await Photo.create({
      uploader: req.user.id,
      url: `${baseUrl}/uploads/${filename}`,
      caption: req.body.caption || ''
    });

    await photo.populate('uploader', 'name');
    res.status(201).json(photo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

router.delete('/:id', protect, async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) return res.status(404).json({ error: 'Foto nao encontrada' });
    if (photo.uploader.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Sem permissao' });
    }

    await photo.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
