const mongoose = require('mongoose');

const backupLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now, index: true },
  type: { type: String, enum: ['Automatic Cloud Backup', 'Manual Excel Export', 'Manual JSON Export', 'System Restore'], default: 'Automatic Cloud Backup' },
  recordCount: { type: Object, default: {} },
  status: { type: String, default: 'Success' },
  initiatedBy: { type: String, default: 'System Automated Scheduler' }
}, { timestamps: true });

module.exports = mongoose.model('BackupLog', backupLogSchema);
