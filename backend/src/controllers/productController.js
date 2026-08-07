const Product = require('../models/Product');
const validator = require('../validators/inputValidator');
const socketService = require('../utils/socketService');

const productController = {
  // Frames
  getFrames: async (req, res) => {
    try {
      const frames = await Product.find({ category: 'Frame' }).sort({ updatedAt: -1 }).lean();
      res.json({ success: true, data: frames });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to fetch frames' });
    }
  },
  createFrame: async (req, res) => {
    const err = validator.validateFrame(req.body);
    if (err) return res.status(400).json({ success: false, message: err });

    try {
      const frameData = {
        ...req.body,
        id: req.body.id || `FRM-${Date.now().toString().slice(-3)}`,
        category: 'Frame',
        updatedAt: new Date()
      };
      const newFrame = await Product.create(frameData);
      socketService.broadcastSync('frame', 'add', newFrame);
      res.status(201).json({ success: true, message: 'Frame added successfully', data: newFrame });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to create frame' });
    }
  },
  updateFrame: async (req, res) => {
    try {
      const updated = await Product.findOneAndUpdate(
        { id: req.params.id, category: 'Frame' },
        { ...req.body, updatedAt: new Date() },
        { new: true }
      );
      if (!updated) return res.status(404).json({ success: false, message: 'Frame not found' });
      socketService.broadcastSync('frame', 'update', updated);
      res.json({ success: true, message: 'Frame updated successfully', data: updated });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to update frame' });
    }
  },
  deleteFrame: async (req, res) => {
    try {
      const result = await Product.deleteOne({ id: req.params.id, category: 'Frame' });
      if (result.deletedCount === 0) return res.status(404).json({ success: false, message: 'Frame not found' });
      socketService.broadcastSync('frame', 'delete', { id: req.params.id });
      res.json({ success: true, message: 'Frame deleted successfully' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to delete frame' });
    }
  },

  // Lenses
  getLenses: async (req, res) => {
    try {
      const lenses = await Product.find({ category: 'Lens' }).sort({ updatedAt: -1 }).lean();
      res.json({ success: true, data: lenses });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to fetch lenses' });
    }
  },
  createLens: async (req, res) => {
    const err = validator.validateLens(req.body);
    if (err) return res.status(400).json({ success: false, message: err });

    try {
      const lensData = {
        ...req.body,
        id: req.body.id || `LNS-${Date.now().toString().slice(-3)}`,
        category: 'Lens',
        updatedAt: new Date()
      };
      const newLens = await Product.create(lensData);
      socketService.broadcastSync('lens', 'add', newLens);
      res.status(201).json({ success: true, message: 'Lens added successfully', data: newLens });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to create lens' });
    }
  },
  updateLens: async (req, res) => {
    try {
      const updated = await Product.findOneAndUpdate(
        { id: req.params.id, category: 'Lens' },
        { ...req.body, updatedAt: new Date() },
        { new: true }
      );
      if (!updated) return res.status(404).json({ success: false, message: 'Lens not found' });
      socketService.broadcastSync('lens', 'update', updated);
      res.json({ success: true, message: 'Lens updated successfully', data: updated });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to update lens' });
    }
  },
  deleteLens: async (req, res) => {
    try {
      const result = await Product.deleteOne({ id: req.params.id, category: 'Lens' });
      if (result.deletedCount === 0) return res.status(404).json({ success: false, message: 'Lens not found' });
      socketService.broadcastSync('lens', 'delete', { id: req.params.id });
      res.json({ success: true, message: 'Lens deleted successfully' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to delete lens' });
    }
  }
};

module.exports = productController;
