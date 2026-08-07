const Invoice = require('../models/Invoice');
const Settings = require('../models/Settings');
const validator = require('../validators/inputValidator');
const socketService = require('../utils/socketService');

const billingController = {
  getAllInvoices: async (req, res) => {
    try {
      const invoices = await Invoice.find().sort({ date: -1 }).lean();
      res.json({ success: true, data: invoices });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to fetch invoices' });
    }
  },

  getInvoiceByNumber: async (req, res) => {
    try {
      const invoice = await Invoice.findOne({ invoiceNumber: req.params.invNum }).lean();
      if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
      res.json({ success: true, data: invoice });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Error fetching invoice' });
    }
  },

  createInvoice: async (req, res) => {
    const err = validator.validateInvoice(req.body);
    if (err) return res.status(400).json({ success: false, message: err });

    try {
      const settingsDoc = await Settings.findOne({ key: 'shop_settings' });
      const settings = settingsDoc ? settingsDoc.data : {};
      
      let invoiceNumber = req.body.invoiceNumber;
      if (!invoiceNumber) {
        const nextNum = parseInt(settings.nextInvoiceNum) || 108;
        invoiceNumber = (settings.invoicePrefix || 'KO-2026-') + nextNum;
        
        // Update settings nextInvoiceNum
        settings.nextInvoiceNum = nextNum + 1;
        if (settingsDoc) {
          settingsDoc.data = settings;
          await settingsDoc.save();
        }
      }

      const invoiceData = {
        ...req.body,
        invoiceNumber,
        createdAt: new Date()
      };
      
      const newInvoice = await Invoice.create(invoiceData);
      socketService.broadcastSync('invoice', 'add', newInvoice);
      if (settingsDoc) socketService.broadcastSync('settings', 'update', settings);
      
      res.status(201).json({ success: true, message: 'Invoice generated successfully', data: newInvoice });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to create invoice' });
    }
  },

  collectPayment: async (req, res) => {
    const { invNum } = req.params;
    const { amount, paymentMethod } = req.body;
    
    try {
      const invoice = await Invoice.findOne({ invoiceNumber: invNum });
      if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

      const payAmt = parseFloat(amount) || 0;
      const newPaid = (parseFloat(invoice.paidAmount) || 0) + payAmt;
      const newDue = Math.max(0, (parseFloat(invoice.netTotal) || 0) - newPaid);
      const newStatus = newDue === 0 ? 'Paid' : 'Partial';

      invoice.paidAmount = newPaid;
      invoice.dueAmount = newDue;
      invoice.paymentStatus = newStatus; // Note: field was called status in original code, but paymentStatus in model/cache
      if (paymentMethod) invoice.paymentMethod = paymentMethod;
      invoice.lastPaymentDate = new Date();

      await invoice.save();
      socketService.broadcastSync('invoice', 'update', invoice);

      res.json({ success: true, message: 'Payment collection recorded', data: invoice });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to collect payment' });
    }
  }
};

module.exports = billingController;
