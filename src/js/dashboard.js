/**
 * KHUSHI OPTICS - Executive Dashboard Controller
 */

const Dashboard = {
  salesChart: null,

  render() {
    this.updateStatCards();
    this.renderLowStockAlerts();
    this.renderRecentBills();
    this.renderSalesChart();
  },

  updateStatCards() {
    const invoices = window.db.getInvoices();
    const customers = window.db.getCustomers();
    const frames = window.db.getFrames();
    const lenses = window.db.getLenses();

    const todayStr = new Date().toISOString().slice(0, 10);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    let todaySales = 0;
    let monthlySales = 0;
    let pendingPayments = 0;
    let completedPayments = 0;

    invoices.forEach(inv => {
      const invDate = new Date(inv.date);
      const isToday = inv.date && inv.date.startsWith(todayStr);
      const isThisMonth = invDate.getMonth() === currentMonth && invDate.getFullYear() === currentYear;

      if (isToday) todaySales += parseFloat(inv.netTotal || 0);
      if (isThisMonth) monthlySales += parseFloat(inv.netTotal || 0);

      const due = parseFloat(inv.balanceDue || 0);
      if (due > 0) {
        pendingPayments += due;
      } else {
        completedPayments += parseFloat(inv.netTotal || 0);
      }
    });

    const totalFramesQty = frames.reduce((acc, f) => acc + (parseInt(f.quantity) || 0), 0);
    const totalLensesQty = lenses.reduce((acc, l) => acc + (parseInt(l.quantity) || 0), 0);

    // Update DOM
    document.getElementById('dashTodaySales').textContent = Utils.formatCurrency(todaySales);
    document.getElementById('dashMonthlySales').textContent = Utils.formatCurrency(monthlySales);
    document.getElementById('dashPendingPayments').textContent = Utils.formatCurrency(pendingPayments);
    document.getElementById('dashCompletedPayments').textContent = Utils.formatCurrency(completedPayments);
    document.getElementById('dashTotalCustomers').textContent = customers.length;
    document.getElementById('dashFramesStock').textContent = `${totalFramesQty} Pcs`;
    document.getElementById('dashLensesStock').textContent = `${totalLensesQty} Pairs`;
  },

  renderLowStockAlerts() {
    const frames = window.db.getFrames();
    const lenses = window.db.getLenses();
    const container = document.getElementById('dashLowStockList');

    if (!container) return;

    const lowFrames = frames.filter(f => parseInt(f.quantity) <= parseInt(f.minAlertQty || 3));
    const lowLenses = lenses.filter(l => parseInt(l.quantity) <= parseInt(l.minAlertQty || 3));

    if (lowFrames.length === 0 && lowLenses.length === 0) {
      container.innerHTML = `<div class="empty-state-sm">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-emerald)" stroke-width="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        <span>All stock levels are optimal</span>
      </div>`;
      return;
    }

    let html = '';
    lowFrames.forEach(f => {
      html += `
        <div class="stock-alert-item">
          <div class="stock-alert-icon frame-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12a5 5 0 005 5h0a5 5 0 005-5V9H2v3zM12 12a5 5 0 005 5h0a5 5 0 005-5V9h-10v3zM10 11h4"/></svg>
          </div>
          <div class="stock-alert-details">
            <div class="stock-alert-name">${f.brand} ${f.model}</div>
            <div class="stock-alert-sub">Frame ID: ${f.id} | Size: ${f.size}</div>
          </div>
          <div class="stock-alert-qty badge badge-danger">${f.quantity} left</div>
        </div>
      `;
    });

    lowLenses.forEach(l => {
      html += `
        <div class="stock-alert-item">
          <div class="stock-alert-icon lens-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/></svg>
          </div>
          <div class="stock-alert-details">
            <div class="stock-alert-name">${l.company} - ${l.type}</div>
            <div class="stock-alert-sub">${l.index}</div>
          </div>
          <div class="stock-alert-qty badge badge-warning">${l.quantity} left</div>
        </div>
      `;
    });

    container.innerHTML = html;
  },

  renderRecentBills() {
    const invoices = window.db.getInvoices();
    const tbody = document.getElementById('dashRecentBillsTbody');
    if (!tbody) return;

    if (!invoices.length) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No invoices generated yet</td></tr>`;
      return;
    }

    const recent = invoices.slice(0, 5);
    let html = '';

    recent.forEach(inv => {
      const statusBadge = inv.balanceDue > 0 
        ? `<span class="badge badge-warning">Pending (${Utils.formatCurrency(inv.balanceDue)})</span>`
        : `<span class="badge badge-success">Paid</span>`;

      html += `
        <tr>
          <td><strong>${inv.invoiceNumber}</strong></td>
          <td>${inv.customerName}</td>
          <td>${Utils.formatDate(inv.date)}</td>
          <td><strong>${Utils.formatCurrency(inv.netTotal)}</strong></td>
          <td><span class="badge badge-info">${inv.paymentMethod}</span></td>
          <td>${statusBadge}</td>
          <td>
            <button class="btn btn-sm btn-secondary" onclick="window.Billing.viewInvoiceDetails('${inv.invoiceNumber}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              View
            </button>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  },

  renderSalesChart() {
    const canvas = document.getElementById('salesChartCanvas');
    if (!canvas) return;

    const invoices = window.db.getInvoices();
    
    // Generate last 7 days sales data
    const days = [];
    const salesData = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit' });
      days.push(label);

      let dayTotal = 0;
      invoices.forEach(inv => {
        if (inv.date && inv.date.startsWith(dateStr)) {
          dayTotal += parseFloat(inv.netTotal || 0);
        }
      });
      salesData.push(dayTotal);
    }

    if (window.Chart) {
      if (this.salesChart) this.salesChart.destroy();
      const ctx = canvas.getContext('2d');

      const gradient = ctx.createLinearGradient(0, 0, 0, 300);
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)');

      this.salesChart = new window.Chart(ctx, {
        type: 'line',
        data: {
          labels: days,
          datasets: [{
            label: 'Sales (₹)',
            data: salesData,
            borderColor: '#3b82f6',
            backgroundColor: gradient,
            borderWidth: 3,
            fill: true,
            tension: 0.35,
            pointBackgroundColor: '#60a5fa',
            pointRadius: 5
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(255, 255, 255, 0.06)' },
              ticks: { color: '#94a3b8', callback: value => '₹' + value }
            },
            x: {
              grid: { color: 'rgba(255, 255, 255, 0.06)' },
              ticks: { color: '#94a3b8' }
            }
          }
        }
      });
    }
  }
};

window.Dashboard = Dashboard;
