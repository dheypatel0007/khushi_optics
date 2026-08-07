const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  jwtSecret: process.env.JWT_SECRET || 'khushi_optics_secret_2026_cloud_rbac',
  mongoUri: process.env.MONGODB_URI || '',
  adminUsername: process.env.ADMIN_USERNAME || 'dheypatel2690@gmail.com',
  adminPassword: process.env.ADMIN_PASSWORD || 'dheypatel0007',
  staffUsername: process.env.STAFF_USERNAME || 'staff@khushioptics.com',
  staffPassword: process.env.STAFF_PASSWORD || 'staff123'
};
