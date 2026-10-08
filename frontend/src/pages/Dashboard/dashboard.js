/**
 * KHUSHI OPTICS - Executive Dashboard Controller
 */

import { Utils } from '../../utils/utils.js';

export const Dashboard = {
  salesChart: null,
  selectedBranch: 'all',

  async render() {
    this.populateBranchFilter();
    this.updateStatCards();
    this.renderLowStockAlerts();
    this.renderRecentBills();
    this.renderSalesChart();
  },

  async populateBranchFilter() {
    const branches = window.db ? await window.db.getBranches() : [];
    const select = document.getElementById('dashBranchSelect');
    if (!select) return;

    let html = `<option value="all">All Shop Branches (Combined)</option>`;
    branches.forEach(b => {
      html += `<option value="${b.name}">${b.name} ${b.isMain ? '(Main Branch)' : ''}</option>`;
    });
    select.innerHTML = html;
    select.value = this.selectedBranch;
  },

  onBranchFilterChange(branchValue) {
    this.selectedBranch = branchValue;
    this.updateStatCards();
    this.renderRecentBills();
    this.renderSalesChart();
  },

  async updateStatCards() {
    const invoices = window.db ? await window.db.getInvoices() : [];
    const customers = window.db ? await window.db.getCustomers() : [];
    const frames = window.db ? await window.db.getFrames() : [];
    const lenses = window.db ? await window.db.getLenses() : [];

    const todayStr = new Date().toISOString().slice(0, 10);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    let todaySales = 0;
    let monthlySales = 0;
    let pendingPayments = 0;
    let completedPayments = 0;
    let mainBranchSales = 0;
    let secondaryBranchesSales = 0;

    invoices.forEach(inv => {
      const invBranch = inv.branchName || 'Bavla Branch (Main)';
      const matchesBranch = this.selectedBranch === 'all' || invBranch === this.selectedBranch;

      if (!matchesBranch) return;

      const invDate = new Date(inv.date);
      const isToday = inv.date && inv.date.startsWith(todayStr);
      const isThisMonth = invDate.getMonth() === currentMonth && invDate.getFullYear() === currentYear;
      const netTotal = parseFloat(inv.netTotal || 0);

      if (isToday) todaySales += netTotal;
      if (isThisMonth) monthlySales += netTotal;

      if (invBranch.includes('Main') || invBranch.includes('Bavla')) {
        mainBranchSales += netTotal;
      } else {
        secondaryBranchesSales += netTotal;
      }

      const due = parseFloat(inv.balanceDue || 0);
      if (due > 0) {
        pendingPayments += due;
      } else {
        completedPayments += netTotal;
      }
    });

    const totalFramesQty = frames.reduce((acc, f) => acc + (parseInt(f.quantity) || 0), 0);
    const totalLensesQty = lenses.reduce((acc, l) => acc + (parseInt(l.quantity) || 0), 0);

    const elToday = document.getElementById('dashTodaySales');
    const elMonthly = document.getElementById('dashMonthlySales');
    const elPending = document.getElementById('dashPendingPayments');
    const elCompleted = document.getElementById('dashCompletedPayments');
    const elCustomers = document.getElementById('dashTotalCustomers');
    const elFrames = document.getElementById('dashFramesStock');
    const elLenses = document.getElementById('dashLensesStock');

    const elMainBranch = document.getElementById('dashMainBranchSales');
    const elSecBranch = document.getElementById('dashSecondaryBranchSales');

    if (elToday) elToday.textContent = Utils.formatCurrency(todaySales);
    if (elMonthly) elMonthly.textContent = Utils.formatCurrency(monthlySales);
    if (elPending) elPending.textContent = Utils.formatCurrency(pendingPayments);
    if (elCompleted) elCompleted.textContent = Utils.formatCurrency(completedPayments);
    if (elCustomers) elCustomers.textContent = customers.length;
    if (elFrames) elFrames.textContent = `${totalFramesQty} Pcs`;
    if (elLenses) elLenses.textContent = `${totalLensesQty} Pairs`;

    if (elMainBranch) elMainBranch.textContent = Utils.formatCurrency(mainBranchSales);
    if (elSecBranch) elSecBranch.textContent = Utils.formatCurrency(secondaryBranchesSales);
  },

  async renderLowStockAlerts() {
    const frames = window.db ? await window.db.getFrames() : [];
    const lenses = window.db ? await window.db.getLenses() : [];
    const container = document.getElementById('dashLowStockList');

    if (!container) return;

    let alertItems = [];

    frames.forEach(f => {
      if (f.quantity <= (f.minAlertQty || 3)) {
        alertItems.push({
          type: 'Frame',
          name: `${f.brand} ${f.model}`,
          qty: f.quantity,
          min: f.minAlertQty || 3
        });
      }
    });

    lenses.forEach(l => {
      if (l.quantity <= 4) {
        alertItems.push({
          type: 'Lens',
          name: `${l.company} (${l.index})`,
          qty: l.quantity,
          min: 4
        });
      }
    });

    if (alertItems.length === 0) {
      container.innerHTML = `<div class="text-muted text-xs text-center py-4">All stock levels healthy! No alerts.</div>`;
      return;
    }

    container.innerHTML = alertItems.map(item => `
      <div class="flex items-center justify-between p-2 rounded" style="background: rgba(244, 63, 94, 0.1); border-left: 3px solid #f43f5e;">
        <div>
          <div class="font-bold text-xs">${item.name} (${item.type})</div>
          <div class="text-xs text-muted">Stock: ${item.qty} (Min Threshold: ${item.min})</div>
        </div>
        <span class="badge badge-danger">Reorder</span>
      </div>
    `).join('');
  },

  async renderRecentBills() {
    const invoices = window.db ? await window.db.getInvoices() : [];
    const tbody = document.getElementById('dashRecentBillsTbody');
    if (!tbody) return;

    const filteredInvoices = invoices.filter(inv => {
      const invBranch = inv.branchName || 'Bavla Branch (Main)';
      return this.selectedBranch === 'all' || invBranch === this.selectedBranch;
    });

    const recent = filteredInvoices.slice(-5).reverse();

    if (recent.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No transactions recorded for this branch</td></tr>`;
      return;
    }

    tbody.innerHTML = recent.map(inv => `
      <tr>
        <td><strong>${inv.invoiceNumber}</strong></td>
        <td>${inv.customerName}<br><small class="text-muted">${inv.branchName || 'Bavla Branch'}</small></td>
        <td>${Utils.formatDate(inv.date)}</td>
        <td><strong>${Utils.formatCurrency(inv.netTotal)}</strong></td>
        <td><span class="badge badge-info">${inv.paymentMethod}</span></td>
        <td><span class="badge ${inv.paymentStatus === 'Paid' ? 'badge-success' : 'badge-warning'}">${inv.paymentStatus}</span></td>
        <td>
          <button class="btn btn-sm btn-secondary" onclick="Billing.printInvoice('${inv.invoiceNumber}');">View Bill</button>
        </td>
      </tr>
    `).join('');
  },

  async renderSalesChart() {
    const canvas = document.getElementById('salesChartCanvas');
    if (!canvas || !window.Chart) return;

    if (this.salesChart) {
      this.salesChart.destroy();
    }

    const invoices = window.db ? await window.db.getInvoices() : [];
    const filteredInvoices = invoices.filter(inv => {
      const invBranch = inv.branchName || 'Bavla Branch (Main)';
      return this.selectedBranch === 'all' || invBranch === this.selectedBranch;
    });

    const labels = [];
    const salesData = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      labels.push(d.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit' }));

      const dayTotal = filteredInvoices
        .filter(inv => inv.date && inv.date.startsWith(dateStr))
        .reduce((sum, inv) => sum + parseFloat(inv.netTotal || 0), 0);

      salesData.push(dayTotal);
    }

    const ctx = canvas.getContext('2d');
    this.salesChart = new window.Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Daily Sales (₹)',
          data: salesData,
          borderColor: '#38bdf8',
          backgroundColor: 'rgba(56, 189, 248, 0.15)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#38bdf8'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { grid: { color: 'rgba(255, 255, 255, 0.05)' } },
          y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, beginAtZero: true }
        }
      }
    });
  }
};

window.Dashboard = Dashboard;
