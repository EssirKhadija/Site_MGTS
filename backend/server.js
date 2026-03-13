// =============================================
// MGTS - Server Entry Point
// =============================================
require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');

const app = require('./app');
const { testConnection } = require('./src/config/db');
const chatSocket = require('./src/sockets/chat.socket');
const notificationSocket = require('./src/sockets/notification.socket');

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Attach socket handlers
chatSocket(io);
notificationSocket(io);

// Make io accessible in controllers via app
app.set('io', io);

// Start server
const start = async () => {
  await testConnection();

  server.listen(PORT, () => {
    console.log('');
    console.log('🚀 ================================');
    console.log(`🚀  MGTS API running on port ${PORT}`);
    console.log(`🚀  ENV: ${process.env.NODE_ENV}`);
    console.log(`🚀  URL: http://localhost:${PORT}/api`);
    console.log('🚀 ================================');
    console.log('');
  });
};

start();
