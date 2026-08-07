const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  location: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  isMain: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, { timestamps: true, strict: false });

module.exports = mongoose.model('Branch', branchSchema);
