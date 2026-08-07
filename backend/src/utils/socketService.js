const logger = require('./logger');
let io = null;

module.exports = {
  setSocketServer: (socketIo) => {
    io = socketIo;
    logger.info('Socket.IO real-time sync server initialized.');
    
    io.on('connection', (socket) => {
      logger.info(`Real-time client connected: ${socket.id}`);
      socket.emit('cloud_connected', { connected: true, timestamp: Date.now() });

      socket.on('disconnect', () => {
        logger.info(`Real-time client disconnected: ${socket.id}`);
      });
    });
  },

  broadcastSync: (type, action, record, excludeSocketId = null) => {
    if (io) {
      const payload = { type, action, record, timestamp: Date.now() };
      if (excludeSocketId) {
        io.except(excludeSocketId).emit('sync_delta', payload);
      } else {
        io.emit('sync_delta', payload);
      }
    }
  }
};
