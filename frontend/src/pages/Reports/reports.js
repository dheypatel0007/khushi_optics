/**
 * KHUSHI OPTICS - Reports & Analytics Controller
 */

import { Utils } from '../../utils/utils.js';

export const Reports = {
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
    const invoices = window.db ? window.db.getInvoices() : [];
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
      } else if (period === '3months') {
        const diffDays = (now - invDate) / (1000 * 3600 * 24);
        match = diffDays <= 90;
      } else if (period === '6months') {
        const diffDays = (now - invDate) / (1000 * 3600 * 24);
        match = diffDays <= 180;
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

    const elRev = document.getElementById('reportTotalRevenue');
    const elColl = document.getElementById('reportPaidCollection');
    const elDue = document.getElementById('reportOutstanding');
    const elDisc = document.getElementById('reportDiscountGiven');
    const elGst = document.getElementById('reportGstCollected');
    const elCount = document.getElementById('reportInvoiceCount');
    const elProfit = document.getElementById('reportEstimatedProfit');

    if (elRev) elRev.textContent = Utils.formatCurrency(totalRevenue);
    if (elColl) elColl.textContent = Utils.formatCurrency(totalPaidCollection);
    if (elDue) elDue.textContent = Utils.formatCurrency(totalOutstanding);
    if (elDisc) elDisc.textContent = Utils.formatCurrency(totalDiscountGiven);
    if (elGst) elGst.textContent = Utils.formatCurrency(totalGstCollected);
    if (elCount) elCount.textContent = totalInvoicesCount;

    const estimatedCost = totalRevenue * 0.6;
    const estimatedProfit = totalRevenue - estimatedCost;
    if (elProfit) elProfit.textContent = Utils.formatCurrency(estimatedProfit);

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
    const invoices = window.db ? window.db.getInvoices() : [];
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
  },

  printSalesReport() {
    const shop = window.db ? window.db.getSettings() : { shopName: 'KHUSHI OPTICS' };
    const periodName = {
      daily: "Today's Sales",
      weekly: "Last 7 Days Sales",
      monthly: "This Month Sales",
      '3months': "Last 3 Months Sales",
      '6months': "Last 6 Months Sales",
      yearly: "This Year Sales"
    }[this.activePeriod] || 'Sales Report';

    const rev = document.getElementById('reportTotalRevenue')?.textContent || '₹0.00';
    const coll = document.getElementById('reportPaidCollection')?.textContent || '₹0.00';
    const due = document.getElementById('reportOutstanding')?.textContent || '₹0.00';
    const profit = document.getElementById('reportEstimatedProfit')?.textContent || '₹0.00';

    const container = document.getElementById('printableInvoiceContainer');
    if (!container) {
      window.print();
      return;
    }

    container.innerHTML = `
      <div class="invoice-paper" style="max-width:800px; padding:2rem; background:#ffffff; color:#0f172a;">
        <div style="text-align:center; border-bottom:3px solid #0284c7; padding-bottom:1rem; margin-bottom:1.5rem;">
          <h2 style="margin:0; color:#0284c7; font-size:1.8rem; font-weight:800;">${shop.shopName}</h2>
          <div style="font-size:0.9rem; color:#475569; margin-top:4px;">${periodName.toUpperCase()} SUMMARY REPORT</div>
          <div style="font-size:0.8rem; color:#64748b; margin-top:2px;">Generated on ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem; margin-bottom:1.5rem; background:#f8fafc; padding:1rem; border-radius:8px; border:1px solid #e2e8f0;">
          <div>Gross Sales Revenue: <strong style="color:#0284c7;">${rev}</strong></div>
          <div>Total Payments Collected: <strong style="color:#166534;">${coll}</strong></div>
          <div>Total Outstanding Dues: <strong style="color:#dc2626;">${due}</strong></div>
          <div>Estimated Net Profit: <strong style="color:#166534;">${profit}</strong></div>
        </div>

        <div style="margin-top:1.5rem; text-align:center; border-top:1px solid #e2e8f0; padding-top:1rem; font-size:0.8rem; color:#64748b;">
          ${shop.shopName} - ${shop.address || 'Bavla, Gujarat'} | Phone: ${shop.phone1 || '9824735065'}
        </div>
      </div>
    `;

    const printBtn = document.getElementById('invoiceModalPrintBtn');
    if (printBtn) printBtn.onclick = () => window.print();

    Utils.openModal('invoiceModal');
  }
};

window.Reports = Reports;
