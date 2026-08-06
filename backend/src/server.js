const app = require('./app');
const env = require('./config/env');
const logger = require('./utils/logger');

const server = app.listen(env.port, () => {
  logger.info(`===================================================`);
  logger.info(` KHUSHI OPTICS BACKEND SERVER RUNNING`);
  logger.info(` Environment: ${env.nodeEnv}`);
  logger.info(` Local API:    http://localhost:${env.port}/api`);
  logger.info(` Health Check: http://localhost:${env.port}/api/health`);
  logger.info(`===================================================`);
});

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection Error:', err);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception Error:', err);
});
