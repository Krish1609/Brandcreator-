const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  'http://localhost:3000',
  process.env.CLIENT_URL,
  process.env.CLIENT_URL ? process.env.CLIENT_URL.replace(/\/$/, '') : null
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl) or any vercel / localhost domain
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(null, true); // Dynamic reflection allows credentials
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
};

const io = new Server(server, {
  cors: corsOptions
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/campaigns', require('./routes/campaigns'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/content', require('./routes/content'));
app.use('/api/instagram', require('./routes/instagram'));

// Socket.IO for real-time chat
const connectedUsers = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (userId) => {
    connectedUsers[userId] = socket.id;
    socket.join(userId);
  });

  socket.on('sendMessage', async (data) => {
    const { receiverId, message, senderId, conversationId } = data;

    // Emit to receiver if online
    if (connectedUsers[receiverId]) {
      io.to(connectedUsers[receiverId]).emit('receiveMessage', {
        senderId,
        message,
        conversationId,
        timestamp: new Date()
      });
    }
  });

  socket.on('disconnect', () => {
    Object.keys(connectedUsers).forEach(userId => {
      if (connectedUsers[userId] === socket.id) {
        delete connectedUsers[userId];
      }
    });
  });
});

// Make io accessible in routes
app.set('io', io);

const { sequelize } = require('./models');

// MySQL Connection
sequelize.authenticate()
  .then(() => {
    console.log('✅ MySQL Connected');
    return sequelize.sync({ force: false });
  })
  .then(() => console.log('✅ MySQL Models Synced'))
  .catch(err => console.error('❌ MySQL Error:', err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
