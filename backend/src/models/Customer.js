const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true, index: true },
  mobile: { type: String, required: true, index: true },
  address: { type: String, default: '' },
  age: { type: Number, default: 0 },
  gender: { type: String, default: '' },
  doctorName: { type: String, default: '' },
  remarks: { type: String, default: '' },
  prescription: {
    rightEye: {
      sph: { type: String, default: '0.00' },
      cyl: { type: String, default: '0.00' },
      axis: { type: String, default: '0' },
      add: { type: String, default: '0.00' },
      pd: { type: String, default: '0.0' }
    },
    leftEye: {
      sph: { type: String, default: '0.00' },
      cyl: { type: String, default: '0.00' },
      axis: { type: String, default: '0' },
      add: { type: String, default: '0.00' },
      pd: { type: String, default: '0.0' }
    }
  },
  dueAmount: { type: Number, default: 0 },
  purchaseHistory: { type: Array, default: [] },
  paymentHistory: { type: Array, default: [] },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true, strict: false });

module.exports = mongoose.model('Customer', customerSchema);
