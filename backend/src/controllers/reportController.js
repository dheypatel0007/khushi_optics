const Invoice = require('../models/Invoice');
const Customer = require('../models/Customer');
const Product = require('../models/Product');

const reportController = {
  getSummary: async (req, res) => {
    try {
      const invoices = await Invoice.find().lean();
      const totalCustomers = await Customer.countDocuments();
      
      let totalSales = 0;
      let totalDues = 0;
      
      invoices.forEach(inv => {
        totalSales += parseFloat(inv.netTotal) || 0;
        totalDues += parseFloat(inv.dueAmount) || 0;
      });

      const products = await Product.find().lean();
      const lowStockCount = products.filter(p => p.quantity <= (p.minAlertQty || 0)).length;

      res.json({
        success: true,
        data: {
          totalSales,
          totalDues,
          totalInvoices: invoices.length,
          totalCustomers,
          lowStockAlerts: lowStockCount
        }
      });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to fetch reports' });
    }
  }
};

module.exports = reportController;
