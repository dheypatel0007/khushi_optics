const mongoose = require('mongoose');
const seedData = require('./seed');
const logger = require('../utils/logger');
const env = require('../config/env');
const models = require('../models');

class CloudDatabase {
  async initDatabase() {
    if (!env.mongoUri) {
      logger.error('CRITICAL: No MONGODB_URI set in environment. An enterprise cloud app requires a cloud database.');
      process.exit(1);
    }

    try {
      await mongoose.connect(env.mongoUri);
      logger.info('Connected to MongoDB Atlas permanent cloud database.');
      await this.syncWithCloud();
    } catch (dbErr) {
      logger.error('MongoDB Atlas connection failed:', dbErr.message);
      process.exit(1);
    }
  }

  async syncWithCloud() {
    try {
      // Check if Cloud DB is seeded
      const custCount = await models.Customer.countDocuments();
      if (custCount === 0) {
        logger.info('Seeding MongoDB Atlas cloud database with initial records...');
        if (seedData.customers?.length) await models.Customer.insertMany(seedData.customers);
        if (seedData.invoices?.length) await models.Invoice.insertMany(seedData.invoices);
        if (seedData.frames?.length) {
          const frames = seedData.frames.map(f => ({ ...f, category: 'Frame' }));
          await models.Product.insertMany(frames);
        }
        if (seedData.lenses?.length) {
          const lenses = seedData.lenses.map(l => ({ ...l, category: 'Lens' }));
          await models.Product.insertMany(lenses);
        }
        if (seedData.settings) {
          await models.Settings.create({ key: 'shop_settings', data: seedData.settings });
        }
      }

      const userCount = await models.User.countDocuments();
      if (userCount === 0) {
        logger.info('Seeding default Admin user...');
        const bcrypt = require('bcryptjs');
        const hash = await bcrypt.hash(env.adminPassword, 10);
        await models.User.create({
          username: env.adminUsername,
          passwordHash: hash,
          name: 'Admin',
          role: 'Admin'
        });
      }
      
      logger.info('Cloud Sync complete. Database is ready.');
    } catch (err) {
      logger.error('Error during initial cloud sync:', err);
    }
  }

  async logBackup(type, count) {
    try {
      await models.BackupLog.create({ type, recordCount: count, status: 'Success' });
    } catch (e) {
      console.error('Backup audit log error:', e);
    }
  }
}

module.exports = new CloudDatabase();
