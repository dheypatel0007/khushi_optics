const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  category: { type: String, enum: ['Frame', 'Lens', 'Accessory', 'Cleaning Kit', 'Contact Lens', 'Sunglasses'], default: 'Frame', index: true },
  brand: { type: String, default: '' },
  model: { type: String, default: '' },
  company: { type: String, default: '' },
  type: { type: String, default: '' },
  features: { type: Array, default: [] },
  index: { type: String, default: '' },
  color: { type: String, default: '' },
  size: { type: String, default: '' },
  purchasePrice: { type: Number, default: 0 },
  sellingPrice: { type: Number, default: 0 },
  quantity: { type: Number, default: 0, index: true },
  minAlertQty: { type: Number, default: 3 },
  barcode: { type: String, default: '' },
  updatedAt: { type: String, default: () => new Date().toISOString().slice(0, 10) }
}, { timestamps: true, strict: false });

module.exports = mongoose.model('Product', productSchema);
