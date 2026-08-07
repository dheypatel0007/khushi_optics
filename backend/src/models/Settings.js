const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, default: 'shop_settings' },
  data: {
    shopName: { type: String, default: 'KHUSHI OPTICS' },
    phone1: { type: String, default: '9824735065' },
    phone2: { type: String, default: '9265778527' },
    upiId: { type: String, default: 'dheypatel2690-1@okicici' },
    address: { type: String, default: 'Krishna Complex, In Front of Yash Bhajipau, Bavla - 382220, Gujarat, India' },
    invoiceFooter: { type: String, default: 'Thank you for choosing KHUSHI OPTICS! Please test your eyes regularly.' },
    terms: { type: String, default: '1. Goods once sold will not be taken back.\n2. 6 Months warranty on frame manufacturing defects.\n3. Lens breakage is not covered under warranty.\n4. Please present this bill for any servicing or queries.' },
    logoUrl: { type: String, default: '' },
    backupFolder: { type: String, default: 'Documents/KHUSHI OPTICS/Backups' },
    theme: { type: String, default: 'dark' },
    gstEnabledDefault: { type: Boolean, default: true },
    defaultGstPercent: { type: Number, default: 12 },
    invoicePrefix: { type: String, default: 'KO-2026-' },
    nextInvoiceNum: { type: Number, default: 108 }
  }
}, { timestamps: true, strict: false });

module.exports = mongoose.model('Settings', settingsSchema);
