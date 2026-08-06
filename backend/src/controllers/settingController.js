const db = require('../database/db');

const settingController = {
  getSettings: (req, res) => {
    res.json({ success: true, data: db.getSettings() });
  },

  updateSettings: (req, res) => {
    const updated = db.updateSettings(req.body);
    res.json({ success: true, message: 'Settings saved successfully', data: updated });
  }
};

module.exports = settingController;
