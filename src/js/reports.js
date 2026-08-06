/**
 * KHUSHI OPTICS - Reports & Analytics Controller
 */

const Reports = {
  activePeriod: 'monthly',

  render() {
    this.generateReports(this.activePeriod);
  },

  setPeriod(period) {
    this.activePeriod = period;
    document.querySelectorAll('.report-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-period') === period);
    });
    this.generateReports(period);
  },

  generateReports(period) {
    const invoices = window.db.getInvoices();
    const framesMap = new Map();
    const lensesMap = new Map();

    let totalRevenue = 0;
    let totalPaidCollection = 0;
    let totalOutstanding = 0;
    let totalDiscountGiven = 0;
    let totalGstCollected = 0;
    let totalInvoicesCount = 0;

    const now = new Date();

    invoices.forEach(inv => {
      const invDate = new Date(inv.date);
      let match = false;

      if (period === 'daily') {
        match = invDate.toDateString() === now.toDateString();
      } else if (period === 'weekly') {
        const diffDays = (now - invDate) / (1000 * 3600 * 24);
        match = diffDays <= 7;
      } else if (period === 'monthly') {
        match = invDate.getMonth() === now.getMonth() && invDate.getFullYear() === now.getFullYear();
      } else if (period === 'yearly') {
        match = invDate.getFullYear() === now.getFullYear();
      }

      if (match) {
        totalInvoicesCount++;
        totalRevenue += parseFloat(inv.netTotal || 0);
        totalPaidCollection += parseFloat(inv.paidAmount || 0);
        totalOutstanding += parseFloat(inv.balanceDue || 0);
        totalDiscountGiven += parseFloat(inv.discountAmount || 0);
        totalGstCollected += parseFloat(inv.totalGstAmount || 0);

        // Track items
        (inv.items || []).forEach(item => {
          if (item.type === 'Frame') {
            const current = framesMap.get(item.title) || { name: item.title, qty: 0, revenue: 0 };
            current.qty += item.qty;
            current.revenue += item.amount;
            framesMap.set(item.title, current);
          } else if (item.type === 'Lens') {
            const current = lensesMap.get(item.title) || { name: item.title, qty: 0, revenue: 0 };
            current.qty += item.qty;
            current.revenue += item.amount;
            lensesMap.set(item.title, current);
          }
        });
      }
    });

    // Update KPI Displays
    document.getElementById('reportTotalRevenue').textContent = Utils.formatCurrency(totalRevenue);
    document.getElementById('reportPaidCollection').textContent = Utils.formatCurrency(totalPaidCollection);
    document.getElementById('reportOutstanding').textContent = Utils.formatCurrency(totalOutstanding);
    document.getElementById('reportDiscountGiven').textContent = Utils.formatCurrency(totalDiscountGiven);
    document.getElementById('reportGstCollected').textContent = Utils.formatCurrency(totalGstCollected);
    document.getElementById('reportInvoiceCount').textContent = totalInvoicesCount;

    // Estimate Profit (Assuming ~40% margin on average sales)
    const estimatedCost = totalRevenue * 0.6;
    const estimatedProfit = totalRevenue - estimatedCost;
    document.getElementById('reportEstimatedProfit').textContent = Utils.formatCurrency(estimatedProfit);

    // Top Selling Frames Table
    const topFrames = Array.from(framesMap.values()).sort((a, b) => b.qty - a.qty);
    const topFramesTbody = document.getElementById('reportTopFramesTbody');
    if (topFramesTbody) {
      if (topFrames.length === 0) {
        topFramesTbody.innerHTML = `<tr><td colspan="3" class="text-muted text-center">No frame sales in this period</td></tr>`;
      } else {
        topFramesTbody.innerHTML = topFrames.map(f => `
          <tr>
            <td><strong>${f.name}</strong></td>
            <td><span class="badge badge-info">${f.qty} sold</span></td>
            <td><strong>${Utils.formatCurrency(f.revenue)}</strong></td>
          </tr>
        `).join('');
      }
    }

    // Top Selling Lenses Table
    const topLenses = Array.from(lensesMap.values()).sort((a, b) => b.qty - a.qty);
    const topLensesTbody = document.getElementById('reportTopLensesTbody');
    if (topLensesTbody) {
      if (topLenses.length === 0) {
        topLensesTbody.innerHTML = `<tr><td colspan="3" class="text-muted text-center">No lens sales in this period</td></tr>`;
      } else {
        topLensesTbody.innerHTML = topLenses.map(l => `
          <tr>
            <td><strong>${l.name}</strong></td>
            <td><span class="badge badge-primary">${l.qty} sold</span></td>
            <td><strong>${Utils.formatCurrency(l.revenue)}</strong></td>
          </tr>
        `).join('');
      }
    }
  },

  exportSalesReportCSV() {
    const invoices = window.db.getInvoices();
    if (!invoices.length) {
      Utils.showToast('No invoices to export', 'warning');
      return;
    }

    const exportRows = invoices.map(inv => ({
      InvoiceNumber: inv.invoiceNumber,
      Date: Utils.formatDate(inv.date),
      CustomerName: inv.customerName,
      Mobile: inv.customerPhone,
      Subtotal: inv.subtotal,
      Discount: inv.discountAmount,
      GST: inv.totalGstAmount,
      NetTotal: inv.netTotal,
      PaidAmount: inv.paidAmount,
      BalanceDue: inv.balanceDue,
      PaymentMethod: inv.paymentMethod,
      PaymentStatus: inv.paymentStatus
    }));

    Utils.exportToCSV(`KHUSHI_OPTICS_Sales_Report_${new Date().toISOString().slice(0, 10)}.csv`, exportRows);
    Utils.showToast('Sales Report exported to CSV!', 'success');
  }
};

window.Reports = Reports;
