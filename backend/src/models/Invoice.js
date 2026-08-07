const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true, index: true },
  date: { type: Date, default: Date.now, index: true },
  customerId: { type: String, ref: 'Customer', index: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String, default: '' },
  customerAddress: { type: String, default: '' },
  prescription: { type: Object, default: {} },
  items: { type: Array, default: [] },
  subtotal: { type: Number, default: 0 },
  discountPercent: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  gstEnabled: { type: Boolean, default: true },
  gstPercent: { type: Number, default: 12 },
  cgstAmount: { type: Number, default: 0 },
  sgstAmount: { type: Number, default: 0 },
  totalGstAmount: { type: Number, default: 0 },
  netTotal: { type: Number, default: 0 },
  paidAmount: { type: Number, default: 0 },
  balanceDue: { type: Number, default: 0, index: true },
  paymentMethod: { type: String, default: 'UPI' },
  paymentStatus: { type: String, default: 'Paid', index: true },
  doctorName: { type: String, default: '' },
  remarks: { type: String, default: '' },
  warrantyDetails: { type: Object, default: {} },
  branchId: { type: String, default: 'BR-01' }
}, { timestamps: true, strict: false });

module.exports = mongoose.model('Invoice', invoiceSchema);
