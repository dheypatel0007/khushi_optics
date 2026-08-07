const Customer = require('../models/Customer');
const validator = require('../validators/inputValidator');
const socketService = require('../utils/socketService');

const customerController = {
  getAll: async (req, res) => {
    try {
      const customers = await Customer.find().sort({ createdAt: -1 }).lean();
      res.json({ success: true, data: customers });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to fetch customers' });
    }
  },

  getById: async (req, res) => {
    try {
      const customer = await Customer.findOne({ id: req.params.id }).lean();
      if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
      res.json({ success: true, data: customer });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Error fetching customer' });
    }
  },

  create: async (req, res) => {
    const err = validator.validateCustomer(req.body);
    if (err) return res.status(400).json({ success: false, message: err });

    try {
      const customerData = {
        ...req.body,
        id: req.body.id || `CUST-${Date.now().toString().slice(-4)}`
      };
      const newCustomer = await Customer.create(customerData);
      socketService.broadcastSync('customer', 'add', newCustomer);
      res.status(201).json({ success: true, message: 'Customer created successfully', data: newCustomer });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to create customer' });
    }
  },

  update: async (req, res) => {
    try {
      const updated = await Customer.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
      if (!updated) return res.status(404).json({ success: false, message: 'Customer not found' });
      socketService.broadcastSync('customer', 'update', updated);
      res.json({ success: true, message: 'Customer updated successfully', data: updated });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to update customer' });
    }
  },

  delete: async (req, res) => {
    try {
      const result = await Customer.deleteOne({ id: req.params.id });
      if (result.deletedCount === 0) return res.status(404).json({ success: false, message: 'Customer not found' });
      socketService.broadcastSync('customer', 'delete', { id: req.params.id });
      res.json({ success: true, message: 'Customer deleted successfully' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to delete customer' });
    }
  }
};

module.exports = customerController;
