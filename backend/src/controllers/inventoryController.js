const db = require('../database/db');

const inventoryController = {
  getAlerts: (req, res) => {
    const frames = db.getFrames().filter(f => f.quantity <= f.minAlertQty);
    const lenses = db.getLenses().filter(l => l.quantity <= l.minAlertQty);
    
    res.json({
      success: true,
      data: {
        totalAlerts: frames.length + lenses.length,
        lowStockFrames: frames,
        lowStockLenses: lenses
      }
    });
  },

  updateQuantity: (req, res) => {
    const { type, id, quantity } = req.body;
    if (type === 'frame') {
      const updated = db.updateFrame(id, { quantity: parseInt(quantity) });
      return res.json({ success: true, data: updated });
    } else if (type === 'lens') {
      const updated = db.updateLens(id, { quantity: parseInt(quantity) });
      return res.json({ success: true, data: updated });
    }
    return res.status(400).json({ success: false, message: 'Invalid product type specified' });
  }
};

module.exports = inventoryController;
