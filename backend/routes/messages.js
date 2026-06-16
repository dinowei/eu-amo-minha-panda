const router  = require('express').Router();
const Message = require('../models/Message');
const protect = require('../middleware/auth');

// GET /api/messages  — histórico completo
router.get('/', protect, async (req, res) => {
  try {
    const messages = await Message.find()
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 })
      .limit(500);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/messages/unread  — não lidas (exceto as minhas)
router.get('/unread', protect, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      sender: { $ne: req.user.id },
      read: false
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/messages/read-all  — marcar todas como lidas
router.put('/read-all', protect, async (req, res) => {
  try {
    await Message.updateMany(
      { sender: { $ne: req.user.id }, read: false },
      { read: true }
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
