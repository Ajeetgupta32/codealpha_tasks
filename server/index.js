require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { connectDB } = require('./db');
const authRoutes = require('./auth');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Production Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for easier development, enable in strict production
}));
app.use(compression());
app.use(cors());
app.use(express.json());

// Rate Limiting for Auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/auth', authLimiter, authRoutes);

// Connect to Database
connectDB();

// Signaling and Room logic
const users = {}; // { socketId: { roomId, username, userId } }

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', ({ roomId, username, userId }) => {
    socket.join(roomId);
    users[socket.id] = { roomId, username, userId };
    
    // Notify others in the room
    const otherUsers = Object.keys(users).filter(
      id => users[id].roomId === roomId && id !== socket.id
    );
    
    socket.emit('all-users', otherUsers.map(id => ({
      socketId: id,
      username: users[id].username,
      userId: users[id].userId
    })));

    console.log(`${username} joined room ${roomId}`);
  });

  socket.on('sending-signal', (payload) => {
    io.to(payload.userToSignal).emit('user-joined', {
      signal: payload.signal,
      callerID: payload.callerID,
      username: payload.username
    });
  });

  socket.on('returning-signal', (payload) => {
    io.to(payload.callerID).emit('receiving-returned-signal', {
      signal: payload.signal,
      id: socket.id
    });
  });

  // Whiteboard synchronization
  socket.on('draw-action', (data) => {
    const user = users[socket.id];
    if (user) {
      socket.to(user.roomId).emit('draw-action', data);
    }
  });

  socket.on('clear-canvas', () => {
    const user = users[socket.id];
    if (user) {
      socket.to(user.roomId).emit('clear-canvas');
    }
  });

  // Chat/Messages
  socket.on('send-message', (messageData) => {
    const user = users[socket.id];
    if (user) {
      io.to(user.roomId).emit('receive-message', {
        ...messageData,
        sender: user.username,
        time: new Date().toLocaleTimeString()
      });
    }
  });

  // Reactions
  socket.on('send-reaction', (emoji) => {
    const user = users[socket.id];
    if (user) {
      io.to(user.roomId).emit('receive-reaction', {
        sender: user.username,
        socketId: socket.id,
        emoji
      });
    }
  });

  socket.on('disconnect', () => {
    const user = users[socket.id];
    if (user) {
      socket.to(user.roomId).emit('user-left', socket.id);
      delete users[socket.id];
    }
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
