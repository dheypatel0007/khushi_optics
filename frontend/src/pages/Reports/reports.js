/**
 * KHUSHI OPTICS - Reports & Business Intelligence Controller
 * Supports 12 preset periods, Custom Date filters, Role-Based Access Control (RBAC),
 * and instant Excel (.xlsx) / CSV / Print exports.
 */

import { Utils } from '../../utils/utils.js';

export const Reports = {
  activePeriod: 'monthly',
  customFrom: null,
  customTo: null,

  async render() {
    this.applyRBAC();
    this.generateReports(this.activePeriod);
  },

  applyRBAC() {
    const role = sessionStorage.getItem('khushi_user_role') || (window.db?.getAdmin()?.role) || 'Admin';
    const profitCard = document.getElementById('reportEstimatedProfit')?.closest('.stat-card');
    if (profitCard) {
      if (role === 'Staff') {
        profitCard.style.display = 'none'; // Staff cannot access sensitive profit margins
      } else {
        profitCard.style.display = 'block';
      }
    }
  },
  async setPeriod(period) {
    this.activePeriod = period;
    this.customFrom = null;
    this.customTo = null;
    document.querySelectorAll('.report-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-period') === period);
    });
    this.generateReports(period);
  },
  async setCustomRange() {
    const fromVal = document.getElementById('reportFromDate')?.value;
    const toVal = document.getElementById('reportToDate')?.value;
    if (!fromVal || !toVal) {
      Utils.showToast('Please select both From and To dates', 'warning');
      return;
    }
    this.customFrom = new Date(fromVal);
    this.customTo = new Date(toVal);
    this.customTo.setHours(23, 59, 59, 999);
    this.activePeriod = 'custom';
    document.querySelectorAll('.report-tab-btn').forEach(btn => btn.classList.remove('active'));
    this.generateReports('custom');
    Utils.showToast(`Showing customized report from ${Utils.formatDate(fromVal)} to ${Utils.formatDate(toVal)}`, 'info');
  },

  filterInvoicesByPeriod(invoices, period) {
    const now = new Date();
    const todayStr = now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    return invoices.filter(inv => {
      if (!inv.date) return false;
      const invDate = new Date(inv.date);

      if (period === 'daily') {
        return invDate.toDateString() === todayStr;
      } else if (period === 'yesterday') {
        return invDate.toDateString() === yesterdayStr;
      } else if (period === 'weekly') {
        const diffDays = (now - invDate) / (1000 * 3600 * 24);
        return diffDays >= 0 && diffDays <= 7;
      } else if (period === '30days') {
        const diffDays = (now - invDate) / (1000 * 3600 * 24);
        return diffDays >= 0 && diffDays <= 30;
      } else if (period === 'monthly') {
        return invDate.getMonth() === now.getMonth() && invDate.getFullYear() === now.getFullYear();
      } else if (period === 'lastmonth') {
        const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return invDate.getMonth() === lastMonthDate.getMonth() && invDate.getFullYear() === lastMonthDate.getFullYear();
      } else if (period === '3months') {
        const diffDays = (now - invDate) / (1000 * 3600 * 24);
        return diffDays >= 0 && diffDays <= 90;
      } else if (period === '6months') {
        const diffDays = (now - invDate) / (1000 * 3600 * 24);
        return diffDays >= 0 && diffDays <= 180;
      } else if (period === 'yearly') {
        return invDate.getFullYear() === now.getFullYear();
      } else if (period === 'lastyear') {
        return invDate.getFullYear() === (now.getFullYear() - 1);
      } else if (period === '3years') {
        return invDate.getFullYear() >= (now.getFullYear() - 3);
      } else if (period === 'lifetime') {
        return true; // All Time
      } else if (period === 'custom') {
        if (!this.customFrom || !this.customTo) return true;
        return invDate >= this.customFrom && invDate <= this.customTo;
      }
      return false;
    });
  },
  async generateReports(period) {
    const allInvoices = window.db ? await window.db.getInvoices() : [];
    const filteredInvoices = this.filterInvoicesByPeriod(allInvoices, period);

    const framesMap = new Map();
    const lensesMap = new Map();

    let totalRevenue = 0;
    let totalPaidCollection = 0;
    let totalOutstanding = 0;
    let totalDiscountGiven = 0;
    let totalGstCollected = 0;
    let totalInvoicesCount = filteredInvoices.length;

    filteredInvoices.forEach(inv => {
      totalRevenue += parseFloat(inv.netTotal || 0);
      totalPaidCollection += parseFloat(inv.paidAmount || 0);
      totalOutstanding += parseFloat(inv.balanceDue || 0);
      totalDiscountGiven += parseFloat(inv.discountAmount || 0);
      totalGstCollected += parseFloat(inv.totalGstAmount || 0);

      (inv.items || []).forEach(item => {
        if (item.type === 'Frame') {
          const current = framesMap.get(item.title) || { name: item.title, qty: 0, revenue: 0 };
          current.qty += parseInt(item.qty || 1);
          current.revenue += parseFloat(item.amount || 0);
          framesMap.set(item.title, current);
        } else if (item.type === 'Lens') {
          const current = lensesMap.get(item.title) || { name: item.title, qty: 0, revenue: 0 };
          current.qty += parseInt(item.qty || 1);
          current.revenue += parseFloat(item.amount || 0);
          lensesMap.set(item.title, current);
        }
      });
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
  async getExportRows() {
    const allInvoices = window.db ? await window.db.getInvoices() : [];
    const filteredInvoices = this.filterInvoicesByPeriod(allInvoices, this.activePeriod);
    
    if (!filteredInvoices.length) {
      Utils.showToast('No sales data in this date range to export', 'warning');
      return null;
    }

    return filteredInvoices.map(inv => ({
      'Invoice Number': inv.invoiceNumber,
      'Billing Date': Utils.formatDate(inv.date),
      'Customer Name': inv.customerName,
      'Mobile Number': inv.customerPhone,
      'Branch': inv.branchId || 'Bavla (Main)',
      'Subtotal Amount (₹)': Number(inv.subtotal || 0),
      'Discount Given (₹)': Number(inv.discountAmount || 0),
      'GST Amount (₹)': Number(inv.totalGstAmount || 0),
      'Net Revenue Total (₹)': Number(inv.netTotal || 0),
      'Amount Collected (₹)': Number(inv.paidAmount || 0),
      'Pending Balance Due (₹)': Number(inv.balanceDue || 0),
      'Payment Mode': inv.paymentMethod || 'UPI',
      'Payment Status': inv.paymentStatus || 'Paid',
      'Doctor Referred': inv.doctorName || ''
    }));
  },

  async exportSalesReportExcel() {
    const exportRows = await this.getExportRows();
    if (!exportRows) return;
    const filename = `KHUSHI_OPTICS_Sales_Report_${this.activePeriod}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    Utils.exportToExcel(filename, exportRows, 'Sales Report');
  },

  async exportSalesReportCSV() {
    const exportRows = await this.getExportRows();
    if (!exportRows) return;
    const filename = `KHUSHI_OPTICS_Sales_Report_${this.activePeriod}_${new Date().toISOString().slice(0, 10)}.csv`;
    Utils.exportToCSV(filename, exportRows);
    Utils.showToast('Sales Report exported to CSV!', 'success');
  },

  async exportSalesReportPDF() {
    if (typeof window.html2pdf === 'undefined') {
      Utils.showToast('PDF Library not loaded. Please try again.', 'error');
      return;
    }

    const shop = window.db ? await window.db.getSettings() : { shopName: 'KHUSHI OPTICS' };
    const periodName = {
      daily: "Today's Sales",
      yesterday: "Yesterday's Sales",
      weekly: "Last 7 Days Sales",
      '30days': "Last 30 Days Sales",
      monthly: "This Month Sales",
      lastmonth: "Last Month Sales",
      '3months': "Last 3 Months Sales",
      '6months': "Last 6 Months Sales",
      yearly: "This Year Sales",
      lastyear: "Last Year Sales",
      '3years': "Last 3 Years Sales",
      lifetime: "All Time (Lifetime) Sales",
      custom: "Custom Date Range Sales"
    }[this.activePeriod] || 'Sales Report';

    const rev = document.getElementById('reportTotalRevenue')?.textContent || '₹0.00';
    const coll = document.getElementById('reportPaidCollection')?.textContent || '₹0.00';
    const due = document.getElementById('reportOutstanding')?.textContent || '₹0.00';
    const profit = document.getElementById('reportEstimatedProfit')?.textContent || '₹0.00';
    const role = sessionStorage.getItem('khushi_user_role') || 'Admin';

    // Build the HTML template
    const element = document.createElement('div');
    element.innerHTML = `
      <div style="padding:40px; background:#ffffff; color:#0f172a; font-family: sans-serif;">
        <div style="text-align:center; border-bottom:3px solid #0284c7; padding-bottom:1rem; margin-bottom:1.5rem;">
          <h2 style="margin:0; color:#0284c7; font-size:1.8rem; font-weight:800;">${shop.shopName}</h2>
          <div style="font-size:0.9rem; color:#475569; margin-top:4px;">${periodName.toUpperCase()} SUMMARY REPORT</div>
          <div style="font-size:0.8rem; color:#64748b; margin-top:2px;">Generated on ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem; margin-bottom:1.5rem; background:#f8fafc; padding:1rem; border-radius:8px; border:1px solid #e2e8f0;">
          <div>Gross Sales Revenue: <strong style="color:#0284c7;">${rev}</strong></div>
          <div>Total Payments Collected: <strong style="color:#166534;">${coll}</strong></div>
          <div>Total Outstanding Dues: <strong style="color:#dc2626;">${due}</strong></div>
          ${role === 'Staff' ? '' : `<div>Estimated Net Profit: <strong style="color:#166534;">${profit}</strong></div>`}
        </div>

        <div style="margin-top:2rem; text-align:center; border-top:1px solid #e2e8f0; padding-top:1rem; font-size:0.8rem; color:#64748b;">
          ${shop.shopName} - ${shop.address || 'Bavla, Gujarat'} | Phone: ${shop.phone1 || '9824735065'}
        </div>
      </div>
    `;

    Utils.showToast('Generating PDF...', 'info');

    const opt = {
      margin:       0.5,
      filename:     `KHUSHI_OPTICS_Sales_Report_${this.activePeriod}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    window.html2pdf().set(opt).from(element).save().then(() => {
      Utils.showToast('PDF Report downloaded successfully!', 'success');
    });
  },

  async printSalesReport() {
    const shop = window.db ? await window.db.getSettings() : { shopName: 'KHUSHI OPTICS' };
    const periodName = {
      daily: "Today's Sales",
      yesterday: "Yesterday's Sales",
      weekly: "Last 7 Days Sales",
      '30days': "Last 30 Days Sales",
      monthly: "This Month Sales",
      lastmonth: "Last Month Sales",
      '3months': "Last 3 Months Sales",
      '6months': "Last 6 Months Sales",
      yearly: "This Year Sales",
      lastyear: "Last Year Sales",
      '3years': "Last 3 Years Sales",
      lifetime: "All Time (Lifetime) Sales",
      custom: "Custom Date Range Sales"
    }[this.activePeriod] || 'Sales Report';

    const rev = document.getElementById('reportTotalRevenue')?.textContent || '₹0.00';
    const coll = document.getElementById('reportPaidCollection')?.textContent || '₹0.00';
    const due = document.getElementById('reportOutstanding')?.textContent || '₹0.00';
    const profit = document.getElementById('reportEstimatedProfit')?.textContent || '₹0.00';
    const role = sessionStorage.getItem('khushi_user_role') || 'Admin';

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
          ${role === 'Staff' ? '' : `<div>Estimated Net Profit: <strong style="color:#166534;">${profit}</strong></div>`}
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
