/**
 * KHUSHI OPTICS - Due Payment Management Controller
 */

import { Utils } from '../../utils/utils.js';

export const Dues = {
  async render() {
    this.renderDuesTable();
  },

  async renderDuesTable(filterQuery = '') {
    const invoices = window.db ? await window.db.getInvoices() : [];
    const tbody = document.getElementById('duesTbody');
    if (!tbody) return;

    const q = filterQuery.toLowerCase();
    const pendingBills = invoices.filter(inv => 
      parseFloat(inv.balanceDue || 0) > 0 &&
      (
        inv.customerName.toLowerCase().includes(q) ||
        inv.customerPhone.includes(q) ||
        inv.invoiceNumber.toLowerCase().includes(q)
      )
    );

    let totalDueSum = 0;
    pendingBills.forEach(b => totalDueSum += parseFloat(b.balanceDue || 0));
    const dispTotal = document.getElementById('duesTotalOutstandingDisplay');
    const dispCount = document.getElementById('duesPendingCountDisplay');
    if (dispTotal) dispTotal.textContent = Utils.formatCurrency(totalDueSum);
    if (dispCount) dispCount.textContent = `${pendingBills.length} Customers`;

    if (pendingBills.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">No outstanding dues pending! Excellent.</td></tr>`;
      return;
    }

    let html = '';
    const today = new Date().toISOString().slice(0, 10);

    pendingBills.forEach(inv => {
      let dueStatusBadge = `<span class="badge badge-warning">Pending</span>`;
      if (inv.dueDate && inv.dueDate < today) {
        dueStatusBadge = `<span class="badge badge-danger">OVERDUE</span>`;
      }

      html += `
        <tr>
          <td><strong>${inv.invoiceNumber}</strong></td>
          <td>
            <strong>${inv.customerName}</strong>
            <div class="text-muted text-xs">${inv.customerAddress || 'Bavla'}</div>
          </td>
          <td><strong>${inv.customerPhone}</strong></td>
          <td>${Utils.formatCurrency(inv.netTotal)}</td>
          <td>${Utils.formatCurrency(inv.paidAmount)}</td>
          <td><strong class="text-danger">${Utils.formatCurrency(inv.balanceDue)}</strong></td>
          <td>${dueStatusBadge}</td>
          <td>
            <div class="btn-group">
              <button class="btn btn-sm btn-success" title="Collect Payment" onclick="window.Dues.openCollectPaymentModal('${inv.invoiceNumber}')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
                Collect
              </button>
              <button class="btn btn-sm btn-secondary" title="WhatsApp Reminder" onclick="window.Dues.sendWhatsAppReminder('${inv.invoiceNumber}')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>
                Reminder
              </button>
            </div>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  },

  async openCollectPaymentModal(invoiceNumber) {
    const inv = window.db ? await window.db.getInvoiceByNumber(invoiceNumber) : null;
    if (!inv) return;

    document.getElementById('collectInvNum').value = inv.invoiceNumber;
    document.getElementById('collectCustomerName').textContent = `${inv.customerName} (${inv.customerPhone})`;
    document.getElementById('collectNetTotal').textContent = Utils.formatCurrency(inv.netTotal);
    document.getElementById('collectAlreadyPaid').textContent = Utils.formatCurrency(inv.paidAmount);
    document.getElementById('collectCurrentDue').textContent = Utils.formatCurrency(inv.balanceDue);
    document.getElementById('collectAmountInput').value = inv.balanceDue;

    Utils.openModal('collectPaymentModal');
  },

  submitPaymentCollection() {
    const invNum = document.getElementById('collectInvNum').value;
    const amount = parseFloat(document.getElementById('collectAmountInput').value) || 0;
    const method = document.getElementById('collectMethodSelect').value;

    if (amount <= 0) {
      Utils.showToast('Please enter a valid payment amount', 'warning');
      return;
    }

    if (window.db) window.db.updateInvoicePayment(invNum, amount, method);
    Utils.closeModal('collectPaymentModal');
    Utils.showToast(`Collected ${Utils.formatCurrency(amount)} for Bill ${invNum}!`, 'success');
    this.renderDuesTable();
  },

  async sendWhatsAppReminder(invoiceNumber) {
    const inv = window.db ? await window.db.getInvoiceByNumber(invoiceNumber) : null;
    if (!inv) return;

    const shop = window.db ? await window.db.getSettings() : { shopName: 'KHUSHI OPTICS' };
    const text = `*Payment Reminder - KHUSHI OPTICS*\n` +
      `Dear ${inv.customerName},\n` +
      `This is a friendly reminder regarding your outstanding payment for Invoice *${inv.invoiceNumber}*.\n\n` +
      `*Total Bill:* ${Utils.formatCurrency(inv.netTotal)}\n` +
      `*Amount Paid:* ${Utils.formatCurrency(inv.paidAmount)}\n` +
      `*Balance Due:* ${Utils.formatCurrency(inv.balanceDue)}\n\n` +
      `Kindly clear the balance at your earliest convenience.\n` +
      `Shop Address: ${shop.address}\n` +
      `Phone: ${shop.phone1} / ${shop.phone2}\n` +
      `Thank you!`;

    const cleanPhone = inv.customerPhone.replace(/[^0-9]/g, '');
    const fullPhone = cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone;
    const url = `https://wa.me/${fullPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  },

  async exportDuesExcel() {
    const invoices = window.db ? await window.db.getInvoices() : [];
    const pendingBills = invoices.filter(inv => parseFloat(inv.balanceDue || 0) > 0);
    if (!pendingBills.length) return Utils.showToast('No pending due payments to export!', 'info');
    const rows = pendingBills.map(inv => ({
      'Invoice Number': inv.invoiceNumber,
      'Billing Date': Utils.formatDate(inv.date),
      'Customer Name': inv.customerName,
      'Mobile Number': inv.customerPhone,
      'Total Bill (₹)': Number(inv.netTotal || 0),
      'Amount Paid (₹)': Number(inv.paidAmount || 0),
      'Outstanding Balance Due (₹)': Number(inv.balanceDue || 0),
      'Last Payment Method': inv.paymentMethod || 'UPI'
    }));
    Utils.exportToExcel(`KHUSHI_OPTICS_Pending_Dues_${new Date().toISOString().slice(0, 10)}.xlsx`, rows, 'Pending Dues');
  },

  async exportDuesCSV() {
    const invoices = window.db ? await window.db.getInvoices() : [];
    const pendingBills = invoices.filter(inv => parseFloat(inv.balanceDue || 0) > 0);
    if (!pendingBills.length) return Utils.showToast('No pending dues to export!', 'info');
    const rows = pendingBills.map(inv => ({ Invoice: inv.invoiceNumber, Date: Utils.formatDate(inv.date), Name: inv.customerName, Phone: inv.customerPhone, NetTotal: inv.netTotal, Paid: inv.paidAmount, Due: inv.balanceDue }));
    Utils.exportToCSV(`KHUSHI_OPTICS_Pending_Dues_${new Date().toISOString().slice(0, 10)}.csv`, rows);
  }
};

window.Dues = Dues;
