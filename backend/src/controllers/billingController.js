const db = require('../database/db');
const validator = require('../validators/inputValidator');

const billingController = {
  getAllInvoices: (req, res) => {
    res.json({ success: true, data: db.getInvoices() });
  },

  getInvoiceByNumber: (req, res) => {
    const invoice = db.getInvoiceByNumber(req.params.invNum);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, data: invoice });
  },

  createInvoice: (req, res) => {
    const err = validator.validateInvoice(req.body);
    if (err) return res.status(400).json({ success: false, message: err });

    const newInvoice = db.addInvoice(req.body);
    res.status(201).json({ success: true, message: 'Invoice generated successfully', data: newInvoice });
  },

  collectPayment: (req, res) => {
    const { invNum } = req.params;
    const { amount, paymentMethod } = req.body;
    
    const invoice = db.getInvoiceByNumber(invNum);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

    const payAmt = parseFloat(amount) || 0;
    const newPaid = (parseFloat(invoice.paidAmount) || 0) + payAmt;
    const newDue = Math.max(0, (parseFloat(invoice.netTotal) || 0) - newPaid);
    const newStatus = newDue === 0 ? 'Paid' : 'Partial';

    const updated = db.updateInvoice(invNum, {
      paidAmount: newPaid,
      dueAmount: newDue,
      status: newStatus,
      paymentMethod: paymentMethod || invoice.paymentMethod
    });

    res.json({ success: true, message: 'Payment collection recorded', data: updated });
  }
};

module.exports = billingController;
