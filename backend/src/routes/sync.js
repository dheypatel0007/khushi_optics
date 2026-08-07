const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.get('/all', (req, res) => {
  try {
    res.json({
      success: true,
      timestamp: Date.now(),
      data: {
        settings: db.getSettings(),
        customers: db.getCustomers(),
        frames: db.getFrames(),
        lenses: db.getLenses(),
        invoices: db.getInvoices(),
        branches: db.data.branches || [],
        cloudConnected: db.cloudConnected
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Sync snapshot error', error: err.message });
  }
});

router.post('/mutate', (req, res) => {
  try {
    const { type, action, data } = req.body;
    db.handleClientMutation({ type, action, data });
    res.json({ success: true, message: 'Cloud mutation recorded & broadcasted in real-time.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Mutation error', error: err.message });
  }
});

router.post('/restore', (req, res) => {
  try {
    const backupData = req.body;
    if (backupData.customers) db.data.customers = backupData.customers;
    if (backupData.frames) db.data.frames = backupData.frames;
    if (backupData.lenses) db.data.lenses = backupData.lenses;
    if (backupData.invoices) db.data.invoices = backupData.invoices;
    if (backupData.shopDetails || backupData.settings) db.updateSettings(backupData.shopDetails || backupData.settings);
    
    db.saveLocalData();
    if (db.cloudConnected) {
      db.syncWithCloud();
    }
    db.broadcastSync('all', 'restore', db.data);
    db.logBackup('System Restore', { total: Object.keys(backupData).length });
    
    res.json({ success: true, message: 'System restored across all logged-in devices.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Restore error', error: err.message });
  }
});

module.exports = router;
