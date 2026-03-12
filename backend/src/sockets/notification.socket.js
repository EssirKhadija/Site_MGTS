const jwt = require('jsonwebtoken');

module.exports = (io) => {

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {

    // Each user joins their own private room
    socket.join(`user_${socket.user.id}`);
    console.log(`🔔 Notification socket: user ${socket.user.id} joined user_${socket.user.id}`);

    socket.on('disconnect', () => {
      console.log(`🔕 Notification socket disconnected: user ${socket.user.id}`);
    });
  });
};