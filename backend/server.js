require('dotenv').config();
const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const cors       = require('cors');
const connectDB  = require('./config/db');

const app    = express();
const server = http.createServer(app);

// ── Socket.io ──────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST']
  }
});

// ── Middlewares ────────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());
app.use('/uploads', express.static('uploads')); // fotos salvas

// ── Banco de dados ─────────────────────────────────────────
connectDB();

// ── Rotas ──────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/photos',   require('./routes/photos'));

app.get('/', (req, res) => res.json({ status: 'Panda API online 🐼' }));

// ── Socket.io: Chat em tempo real ──────────────────────────
const jwt = require('jsonwebtoken');

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Sem token'));
  try {
    socket.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    next(new Error('Token inválido'));
  }
});

io.on('connection', (socket) => {
  console.log(`🟢 Conectado: ${socket.user.name}`);

  // Entrar na sala privada (sempre a mesma para os 2 usuários)
  socket.join('panda-room');

  socket.on('send_message', async (data) => {
    const Message = require('./models/Message');
    const msg = await Message.create({
      sender:  socket.user.id,
      content: data.content,
      read:    false
    });

    // Popula o sender para enviar nome junto
    await msg.populate('sender', 'name');

    io.to('panda-room').emit('receive_message', {
      _id:       msg._id,
      content:   msg.content,
      sender:    { _id: msg.sender._id, name: msg.sender.name },
      createdAt: msg.createdAt,
      read:      msg.read
    });
  });

  socket.on('typing', (isTyping) => {
    socket.to('panda-room').emit('user_typing', {
      name: socket.user.name,
      isTyping
    });
  });

  socket.on('disconnect', () => {
    console.log(`🔴 Desconectado: ${socket.user.name}`);
  });
});

// ── Start ──────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`🐼 Servidor rodando na porta ${PORT}`));
