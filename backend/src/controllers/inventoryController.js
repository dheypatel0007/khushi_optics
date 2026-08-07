const Product = require('../models/Product');
const socketService = require('../utils/socketService');

const inventoryController = {
  getAlerts: async (req, res) => {
    try {
      const products = await Product.find().lean();
      const frames = products.filter(p => p.category === 'Frame' && p.quantity <= (p.minAlertQty || 0));
      const lenses = products.filter(p => p.category === 'Lens' && p.quantity <= (p.minAlertQty || 0));
      
      res.json({
        success: true,
        data: {
          totalAlerts: frames.length + lenses.length,
          lowStockFrames: frames,
          lowStockLenses: lenses
        }
      });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to fetch inventory alerts' });
    }
  },

  updateQuantity: async (req, res) => {
    const { type, id, quantity } = req.body;
    const categoryMap = { 'frame': 'Frame', 'lens': 'Lens' };
    const category = categoryMap[type];

    if (!category) {
      return res.status(400).json({ success: false, message: 'Invalid product type specified' });
    }

    try {
      const updated = await Product.findOneAndUpdate(
        { id, category },
        { quantity: parseInt(quantity) },
        { new: true }
      );
      if (updated) {
        socketService.broadcastSync(type, 'update', updated);
        return res.json({ success: true, data: updated });
      }
      return res.status(404).json({ success: false, message: 'Product not found' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to update quantity' });
    }
  }
};

module.exports = inventoryController;
