const http = require('http');
const socketIo = require('socket.io');
const app = require('./app');
const env = require('./config/env');
const logger = require('./utils/logger');
const db = require('./database/db');
const socketService = require('./utils/socketService');

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// Attach socket server
socketService.setSocketServer(io);

// Initialize DB and Start Server
db.initDatabase().then(() => {
  server.listen(env.port, () => {
    logger.info(`===================================================`);
    logger.info(` KHUSHI OPTICS ENTERPRISE CLOUD SERVER RUNNING`);
    logger.info(` Environment: ${env.nodeEnv}`);
    logger.info(` Local API:    http://localhost:${env.port}/api`);
    logger.info(` Real-time WS: ws://localhost:${env.port}`);
    logger.info(`===================================================`);
  });
}).catch(err => {
  logger.error('Failed to initialize database, shutting down...', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection Error:', err);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception Error:', err);
});
