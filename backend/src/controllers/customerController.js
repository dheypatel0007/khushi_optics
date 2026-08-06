const db = require('../database/db');
const validator = require('../validators/inputValidator');

const customerController = {
  getAll: (req, res) => {
    const customers = db.getCustomers();
    res.json({ success: true, data: customers });
  },

  getById: (req, res) => {
    const customer = db.getCustomerById(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    res.json({ success: true, data: customer });
  },

  create: (req, res) => {
    const err = validator.validateCustomer(req.body);
    if (err) return res.status(400).json({ success: false, message: err });

    const newCustomer = db.addCustomer(req.body);
    res.status(201).json({ success: true, message: 'Customer created successfully', data: newCustomer });
  },

  update: (req, res) => {
    const updated = db.updateCustomer(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'Customer not found' });
    res.json({ success: true, message: 'Customer updated successfully', data: updated });
  },

  delete: (req, res) => {
    const deleted = db.deleteCustomer(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Customer not found' });
    res.json({ success: true, message: 'Customer deleted successfully' });
  }
};

module.exports = customerController;
