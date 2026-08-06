const db = require('../database/db');

const reportController = {
  getSummary: (req, res) => {
    const invoices = db.getInvoices();
    const customers = db.getCustomers();
    const frames = db.getFrames();
    const lenses = db.getLenses();

    let totalSales = 0;
    let totalDues = 0;
    
    invoices.forEach(inv => {
      totalSales += parseFloat(inv.netTotal) || 0;
      totalDues += parseFloat(inv.dueAmount) || 0;
    });

    const lowStockCount = frames.filter(f => f.quantity <= f.minAlertQty).length +
                         lenses.filter(l => l.quantity <= l.minAlertQty).length;

    res.json({
      success: true,
      data: {
        totalSales,
        totalDues,
        totalInvoices: invoices.length,
        totalCustomers: customers.length,
        lowStockAlerts: lowStockCount
      }
    });
  }
};

module.exports = reportController;
