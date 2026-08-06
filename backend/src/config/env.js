const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  jwtSecret: process.env.JWT_SECRET || 'khushi_optics_secret_2026',
  adminUsername: process.env.ADMIN_USERNAME || 'dhey',
  adminPassword: process.env.ADMIN_PASSWORD || 'dheypatel0007'
};
