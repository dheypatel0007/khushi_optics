const Settings = require('../models/Settings');
const socketService = require('../utils/socketService');

const settingController = {
  getSettings: async (req, res) => {
    try {
      const settingsDoc = await Settings.findOne({ key: 'shop_settings' }).lean();
      res.json({ success: true, data: settingsDoc ? settingsDoc.data : {} });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to fetch settings' });
    }
  },

  updateSettings: async (req, res) => {
    try {
      const updated = await Settings.findOneAndUpdate(
        { key: 'shop_settings' },
        { data: req.body },
        { upsert: true, new: true }
      );
      socketService.broadcastSync('settings', 'update', updated.data);
      res.json({ success: true, message: 'Settings saved successfully', data: updated.data });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to update settings' });
    }
  }
};

module.exports = settingController;
