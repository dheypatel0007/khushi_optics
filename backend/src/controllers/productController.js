const db = require('../database/db');
const validator = require('../validators/inputValidator');

const productController = {
  // Frames
  getFrames: (req, res) => {
    res.json({ success: true, data: db.getFrames() });
  },
  createFrame: (req, res) => {
    const err = validator.validateFrame(req.body);
    if (err) return res.status(400).json({ success: false, message: err });

    const newFrame = db.addFrame(req.body);
    res.status(201).json({ success: true, message: 'Frame added successfully', data: newFrame });
  },
  updateFrame: (req, res) => {
    const updated = db.updateFrame(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'Frame not found' });
    res.json({ success: true, message: 'Frame updated successfully', data: updated });
  },
  deleteFrame: (req, res) => {
    const deleted = db.deleteFrame(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Frame not found' });
    res.json({ success: true, message: 'Frame deleted successfully' });
  },

  // Lenses
  getLenses: (req, res) => {
    res.json({ success: true, data: db.getLenses() });
  },
  createLens: (req, res) => {
    const err = validator.validateLens(req.body);
    if (err) return res.status(400).json({ success: false, message: err });

    const newLens = db.addLens(req.body);
    res.status(201).json({ success: true, message: 'Lens added successfully', data: newLens });
  },
  updateLens: (req, res) => {
    const updated = db.updateLens(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'Lens not found' });
    res.json({ success: true, message: 'Lens updated successfully', data: updated });
  },
  deleteLens: (req, res) => {
    const deleted = db.deleteLens(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Lens not found' });
    res.json({ success: true, message: 'Lens deleted successfully' });
  }
};

module.exports = productController;
