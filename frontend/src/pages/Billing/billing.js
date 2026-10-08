/**
 * KHUSHI OPTICS - 8-Step POS Billing & Invoice Engine
 */

import { Utils } from '../../utils/utils.js';

export const Billing = {
  activeInvoice: {
    customer: null,
    selectedFrame: null,
    selectedLens: null,
    extraItems: [],
    discountPercent: 0,
    customDiscount: 0,
    gstEnabled: true,
    gstPercent: 12,
    paymentMethod: 'Cash',
    paidAmount: 0,
    dueDate: ''
  },

  async render() {
    this.populateCustomerDropdown();
    this.populateFrameDropdown();
    this.populateLensDropdown();
    this.populateBranchDropdown();
    this.recalculateTotals();
  },

  startNewBillForCustomer(customerId) {
    if (window.App) window.App.navigateTo('billingView');
    setTimeout(() => {
      const select = document.getElementById('posCustomerSelect');
      if (select) {
        select.value = customerId;
        this.handleCustomerSelection(customerId);
      }
    }, 100);
  },
  async populateBranchDropdown() {
    const branches = window.db ? await window.db.getBranches() : [];
    const select = document.getElementById('posBranchSelect');
    if (!select) return;

    select.innerHTML = branches.map(b => {
      const hasMainInName = b.name.includes('(Main)');
      const label = (hasMainInName || !b.isMain) ? b.name : `${b.name} (Main)`;
      return `<option value="${b.name}">${label}</option>`;
    }).join('');
  },

  async populateCustomerDropdown() {
    const customers = window.db ? await window.db.getCustomers() : [];
    const select = document.getElementById('posCustomerSelect');
    if (!select) return;

    let html = `<option value="">-- Select Existing Customer --</option>`;
    customers.forEach(c => {
      html += `<option value="${c.id}">${c.name} (${c.mobile}) - ID: ${c.id}</option>`;
    });
    select.innerHTML = html;
  },

  async populateFrameDropdown() {
    const frames = window.db ? await window.db.getFrames() : [];
    const select = document.getElementById('posFrameSelect');
    if (!select) return;

    let html = `<option value="">-- Select Frame from Inventory --</option>`;
    frames.forEach(f => {
      const isLow = f.quantity <= f.minAlertQty ? ' [LOW STOCK]' : '';
      html += `<option value="${f.id}" ${f.quantity <= 0 ? 'disabled' : ''}>${f.brand} ${f.model} (${f.type}) - ${Utils.formatCurrency(f.sellingPrice)}${isLow}</option>`;
    });
    select.innerHTML = html;
  },

  async populateLensDropdown() {
    const lenses = window.db ? await window.db.getLenses() : [];
    const select = document.getElementById('posLensSelect');
    if (!select) return;

    let html = `<option value="">-- Select Lens Type --</option>`;
    lenses.forEach(l => {
      const feats = (l.features || []).join(', ');
      html += `<option value="${l.id}">${l.company} - ${l.type} (${l.index}) [${feats}] - ${Utils.formatCurrency(l.sellingPrice)}</option>`;
    });
    select.innerHTML = html;
  },
  async handleCustomerSelection(customerId) {
    if (!customerId) {
      this.activeInvoice.customer = null;
      const card = document.getElementById('posCustomerDetailsCard');
      if (card) card.style.display = 'none';
      return;
    }

    const customer = window.db ? await window.db.getCustomerById(customerId) : null;
    if (customer) {
      this.activeInvoice.customer = customer;
      const detailsCard = document.getElementById('posCustomerDetailsCard');
      if (detailsCard) {
        detailsCard.style.display = 'block';
        const rx = customer.prescription || { rightEye: {}, leftEye: {} };
        const lensRec = Utils.recommendLensType(rx.rightEye.sph, rx.leftEye.sph);

        detailsCard.innerHTML = `
          <div class="pos-cust-summary">
            <div><strong>${customer.name}</strong> (${customer.mobile})</div>
            <div class="text-xs text-muted">${customer.address || 'Bavla'} | Doctor: ${customer.doctorName || 'Dr. V. K. Shah'}</div>
            
            <div class="mt-2 text-xs font-mono bg-dark-card p-2 rounded border border-slate-700">
              RE: SPH ${rx.rightEye.sph || '0.00'} CYL ${rx.rightEye.cyl || '0.00'} AXIS ${rx.rightEye.axis || '0'}° ADD ${rx.rightEye.add || '0.00'}<br>
              LE: SPH ${rx.leftEye.sph || '0.00'} CYL ${rx.leftEye.cyl || '0.00'} AXIS ${rx.leftEye.axis || '0'}° ADD ${rx.leftEye.add || '0.00'}
            </div>

            <div class="mt-2 text-xs text-primary font-bold">
              💡 Smart Recommendation: ${lensRec.index}
            </div>
          </div>
        `;
      }
    }
  },
  async handleFrameSelection(frameId) {
    if (!frameId) {
      this.activeInvoice.selectedFrame = null;
      const el = document.getElementById('posFramePriceDisplay');
      if (el) el.textContent = '₹0.00';
    } else {
      const frame = window.db ? await window.db.getFrameById(frameId) : null;
      if (frame) {
        this.activeInvoice.selectedFrame = frame;
        const el = document.getElementById('posFramePriceDisplay');
        if (el) el.textContent = Utils.formatCurrency(frame.sellingPrice);
      }
    }
    this.recalculateTotals();
  },
  async handleLensSelection(lensId) {
    if (!lensId) {
      this.activeInvoice.selectedLens = null;
      const el = document.getElementById('posLensPriceDisplay');
      if (el) el.textContent = '₹0.00';
    } else {
      const lens = window.db ? await window.db.getLensById(lensId) : null;
      if (lens) {
        this.activeInvoice.selectedLens = lens;
        const el = document.getElementById('posLensPriceDisplay');
        if (el) el.textContent = Utils.formatCurrency(lens.sellingPrice);
      }
    }
    this.recalculateTotals();
  },
  async handlePaymentMethodChange(method) {
    const qrContainer = document.getElementById('posUpiQrPreviewCard');
    if (qrContainer) {
      qrContainer.style.display = method === 'UPI' ? 'block' : 'none';
    }
    this.recalculateTotals();
  },

  showUPIQRModal() {
    const netTotal = this.activeInvoice.netTotal || 0;
    const el = document.getElementById('upiQrModalAmount');
    if (el) el.textContent = Utils.formatCurrency(netTotal);
    Utils.openModal('upiQrModal');
  },
  async recalculateTotals() {
    const framePrice = this.activeInvoice.selectedFrame ? parseFloat(this.activeInvoice.selectedFrame.sellingPrice) : 0;
    const lensPrice = this.activeInvoice.selectedLens ? parseFloat(this.activeInvoice.selectedLens.sellingPrice) : 0;
    const extraPrice = parseFloat(document.getElementById('posExtraChargesInput')?.value) || 0;

    const subtotal = framePrice + lensPrice + extraPrice;
    const subEl = document.getElementById('posSubtotalDisplay');
    if (subEl) subEl.textContent = Utils.formatCurrency(subtotal);

    const discountSelect = document.getElementById('posDiscountSelect')?.value || '0';
    let discountPercent = 0;

    const customGroup = document.getElementById('posCustomDiscountGroup');
    if (discountSelect === 'custom') {
      if (customGroup) customGroup.style.display = 'block';
      discountPercent = parseFloat(document.getElementById('posCustomDiscountInput')?.value) || 0;
    } else {
      if (customGroup) customGroup.style.display = 'none';
      discountPercent = parseFloat(discountSelect) || 0;
    }

    const discountAmount = (subtotal * discountPercent) / 100;
    const afterDiscount = Math.max(0, subtotal - discountAmount);

    const discEl = document.getElementById('posDiscountAmountDisplay');
    if (discEl) discEl.textContent = `- ${Utils.formatCurrency(discountAmount)}`;

    const gstToggle = document.getElementById('posGstToggle')?.checked;
    let gstPercent = parseFloat(document.getElementById('posGstPercentSelect')?.value) || 12;
    let cgst = 0;
    let sgst = 0;
    let totalGst = 0;

    const gstRow = document.getElementById('posGstRow');
    if (gstToggle) {
      totalGst = (afterDiscount * gstPercent) / 100;
      cgst = totalGst / 2;
      sgst = totalGst / 2;
      if (gstRow) gstRow.style.display = 'flex';
      const gstEl = document.getElementById('posGstAmountDisplay');
      if (gstEl) gstEl.textContent = `+ ${Utils.formatCurrency(totalGst)} (CGST ${cgst.toFixed(2)} + SGST ${sgst.toFixed(2)})`;
    } else {
      if (gstRow) gstRow.style.display = 'none';
    }

    const netTotal = Math.round(afterDiscount + totalGst);
    const netEl = document.getElementById('posNetTotalDisplay');
    if (netEl) netEl.textContent = Utils.formatCurrency(netTotal);

    const paidInput = document.getElementById('posPaidAmountInput');
    let paidAmount = parseFloat(paidInput?.value);
    if (isNaN(paidAmount)) {
      paidAmount = netTotal;
      if (paidInput) paidInput.value = netTotal;
    }

    const balanceDue = Math.max(0, netTotal - paidAmount);
    const balEl = document.getElementById('posBalanceDueDisplay');
    if (balEl) balEl.textContent = Utils.formatCurrency(balanceDue);

    const paymentStatusBadge = document.getElementById('posPaymentStatusBadge');
    const dueDateGroup = document.getElementById('posDueDateGroup');
    if (paymentStatusBadge) {
      if (balanceDue <= 0) {
        paymentStatusBadge.className = 'badge badge-success';
        paymentStatusBadge.textContent = 'Full Payment (Paid)';
        if (dueDateGroup) dueDateGroup.style.display = 'none';
      } else {
        paymentStatusBadge.className = 'badge badge-warning';
        paymentStatusBadge.textContent = `Credit/Due: ${Utils.formatCurrency(balanceDue)}`;
        if (dueDateGroup) dueDateGroup.style.display = 'block';
      }
    }

    this.activeInvoice.subtotal = subtotal;
    this.activeInvoice.discountPercent = discountPercent;
    this.activeInvoice.discountAmount = discountAmount;
    this.activeInvoice.gstEnabled = gstToggle;
    this.activeInvoice.gstPercent = gstPercent;
    this.activeInvoice.cgstAmount = cgst;
    this.activeInvoice.sgstAmount = sgst;
    this.activeInvoice.totalGstAmount = totalGst;
    this.activeInvoice.netTotal = netTotal;
    this.activeInvoice.paidAmount = paidAmount;
    this.activeInvoice.balanceDue = balanceDue;
  },
  async generateAndSaveInvoice() {
    if (!this.activeInvoice.customer) {
      Utils.showToast('Please select or create a Customer first!', 'warning');
      return;
    }

    if (!this.activeInvoice.selectedFrame && !this.activeInvoice.selectedLens) {
      Utils.showToast('Please select at least a Frame or Lens item', 'warning');
      return;
    }

    const items = [];
    if (this.activeInvoice.selectedFrame) {
      items.push({
        type: 'Frame',
        id: this.activeInvoice.selectedFrame.id,
        title: `${this.activeInvoice.selectedFrame.brand} ${this.activeInvoice.selectedFrame.model} (${this.activeInvoice.selectedFrame.type})`,
        qty: 1,
        unitPrice: this.activeInvoice.selectedFrame.sellingPrice,
        amount: this.activeInvoice.selectedFrame.sellingPrice
      });
      if (window.db) window.db.updateFrameStock(this.activeInvoice.selectedFrame.id, -1);
    }

    if (this.activeInvoice.selectedLens) {
      items.push({
        type: 'Lens',
        id: this.activeInvoice.selectedLens.id,
        title: `${this.activeInvoice.selectedLens.company} ${this.activeInvoice.selectedLens.type} (${this.activeInvoice.selectedLens.index})`,
        qty: 1,
        unitPrice: this.activeInvoice.selectedLens.sellingPrice,
        amount: this.activeInvoice.selectedLens.sellingPrice
      });
      if (window.db) window.db.updateLensStock(this.activeInvoice.selectedLens.id, -1);
    }

    const extraPrice = parseFloat(document.getElementById('posExtraChargesInput')?.value) || 0;
    if (extraPrice > 0) {
      items.push({
        type: 'Service',
        id: 'SRV-01',
        title: 'Fitting / Cleaning & Accessories',
        qty: 1,
        unitPrice: extraPrice,
        amount: extraPrice
      });
    }

    const paymentMethod = document.getElementById('posPaymentMethodSelect').value;
    const remarks = document.getElementById('posRemarksInput').value.trim();
    const dueDate = document.getElementById('posDueDateInput').value;
    const branchName = document.getElementById('posBranchSelect')?.value || 'Bavla Branch (Main)';

    const invoiceRecord = {
      date: new Date().toISOString(),
      branchName,
      customerId: this.activeInvoice.customer.id,
      customerName: this.activeInvoice.customer.name,
      customerPhone: this.activeInvoice.customer.mobile,
      customerAddress: this.activeInvoice.customer.address,
      prescription: this.activeInvoice.customer.prescription,
      doctorName: this.activeInvoice.customer.doctorName || 'Dr. V. K. Shah',
      items,
      subtotal: this.activeInvoice.subtotal,
      discountPercent: this.activeInvoice.discountPercent,
      discountAmount: this.activeInvoice.discountAmount,
      gstEnabled: this.activeInvoice.gstEnabled,
      gstPercent: this.activeInvoice.gstPercent,
      cgstAmount: this.activeInvoice.cgstAmount,
      sgstAmount: this.activeInvoice.sgstAmount,
      totalGstAmount: this.activeInvoice.totalGstAmount,
      netTotal: this.activeInvoice.netTotal,
      paidAmount: this.activeInvoice.paidAmount,
      balanceDue: this.activeInvoice.balanceDue,
      paymentMethod,
      paymentStatus: this.activeInvoice.balanceDue <= 0 ? 'Paid' : 'Pending',
      dueDate: dueDate || undefined,
      remarks
    };

    try {
      const savedInvoice = window.db ? window.db.saveInvoice(invoiceRecord) : invoiceRecord;
      Utils.showToast(`Invoice ${savedInvoice.invoiceNumber} generated!`, 'success');

      await this.printInvoice(savedInvoice.invoiceNumber);

      // Don't await autoSave, let it run in background
      this.autoSavePDFToFile(savedInvoice).catch(e => console.error(e));

      await this.resetBillingForm();
    } catch (err) {
      console.error("Error in generateAndSaveInvoice:", err);
      Utils.showToast("An error occurred while generating the invoice.", "error");
    }
  },
  async resetBillingForm() {
    this.activeInvoice = {
      customer: null,
      selectedFrame: null,
      selectedLens: null,
      extraItems: [],
      discountPercent: 0,
      customDiscount: 0,
      gstEnabled: true,
      gstPercent: 12,
      paymentMethod: 'Cash',
      paidAmount: 0,
      dueDate: ''
    };

    const custSel = document.getElementById('posCustomerSelect');
    const frmSel = document.getElementById('posFrameSelect');
    const lnsSel = document.getElementById('posLensSelect');
    const extIn = document.getElementById('posExtraChargesInput');
    const discSel = document.getElementById('posDiscountSelect');
    const custDisc = document.getElementById('posCustomDiscountInput');
    const remIn = document.getElementById('posRemarksInput');
    const custCard = document.getElementById('posCustomerDetailsCard');
    const qrCard = document.getElementById('posUpiQrPreviewCard');

    if (custSel) custSel.value = '';
    if (frmSel) frmSel.value = '';
    if (lnsSel) lnsSel.value = '';
    if (extIn) extIn.value = '';
    if (discSel) discSel.value = '0';
    if (custDisc) custDisc.value = '';
    if (remIn) remIn.value = '';
    if (custCard) custCard.style.display = 'none';
    if (qrCard) qrCard.style.display = 'none';

    this.recalculateTotals();
  },

  async printInvoice(invoiceNumber) {
    const invoice = window.db ? await window.db.getInvoiceByNumber(invoiceNumber) : null;
    if (!invoice) return;

    const shop = window.db ? await window.db.getSettings() : { shopName: 'KHUSHI OPTICS' };
    const container = document.getElementById('printableInvoiceContainer');
    if (!container) return;

    container.innerHTML = await this.generateInvoiceHtml(invoice, shop, true);

    const printBtn = document.getElementById('invoiceModalPrintBtn');
    const pdfBtn = document.getElementById('invoiceModalPdfBtn');
    const waBtn = document.getElementById('invoiceModalWhatsappBtn');

    if (printBtn) printBtn.onclick = () => this.printInvoiceAction();
    if (pdfBtn) pdfBtn.onclick = () => this.downloadInvoicePDF(invoice);
    if (waBtn) waBtn.onclick = () => this.shareWhatsAppInvoice(invoice);

    let warrantyBtn = document.getElementById('invoiceModalWarrantyBtn');
    if (!warrantyBtn) {
      warrantyBtn = document.createElement('button');
      warrantyBtn.id = 'invoiceModalWarrantyBtn';
      warrantyBtn.className = 'btn btn-secondary';
      warrantyBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> Warranty Card`;
      const footer = document.querySelector('#invoiceModal .modal-footer');
      if (footer && printBtn) footer.insertBefore(warrantyBtn, printBtn);
    }
    warrantyBtn.onclick = () => this.generateWarrantyCard(invoice);

    Utils.openModal('invoiceModal');
  },

  async generateInvoiceHtml(invoice, shop, isPrint = false) {
    const shopData = shop || (window.db ? await window.db.getSettings() : { shopName: 'KHUSHI OPTICS' });
    const rx = invoice.prescription || { rightEye: {}, leftEye: {} };
    const d = new Date(invoice.date);
    const dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase();
    let itemsHtml = '';
    invoice.items.forEach(item => {
      itemsHtml += `
        <tr>
          <td><strong>${item.title}</strong></td>
          <td style="text-align:center;">${item.qty}</td>
          <td style="text-align:right;">${Utils.formatCurrency(item.unitPrice)}</td>
          <td style="text-align:right;"><strong>${Utils.formatCurrency(item.amount)}</strong></td>
        </tr>
      `;
    });

    const formatRx = (val) => {
      if (val === undefined || val === null || val === '') return '0.00';
      const str = String(val).trim();
      const num = parseFloat(str);
      if (isNaN(num)) return str;
      let formatted = num.toFixed(2);
      if (str.startsWith('+') && num > 0) formatted = '+' + formatted;
      return formatted;
    };

    const formatAxis = (val) => {
      if (val === undefined || val === null || val === '') return '0°';
      const str = String(val).trim().replace(/[°*]/g, '');
      return str + '°';
    };

    const qrCodeHtml = Utils.generateUPIQRCode(shopData.upiId || 'dheypatel2690-1@okicici', shopData.shopName, invoice.netTotal, invoice.invoiceNumber);

    return `
      <div class="invoice-paper" id="invoicePaper">
        <div class="inv-header">
          <div class="inv-brand">
            <h2>${shopData.shopName}</h2>
            <div class="inv-sub font-mono">${shopData.address}</div>
            <div class="inv-sub">Phone: <strong>${shopData.phone1}</strong> / <strong>${shopData.phone2}</strong></div>
          </div>
          <div class="inv-title-container">
            <div class="inv-title">TAX INVOICE</div>
          </div>
          <div class="inv-meta">
            <div class="inv-num">Inv #: <strong>${invoice.invoiceNumber}</strong></div>
            <div class="invoice-date">
              <div>Date: ${dateStr}</div>
              <div>${timeStr}</div>
            </div>
            <div class="inv-status-tag ${invoice.balanceDue <= 0 ? 'paid' : 'due'}">${invoice.paymentStatus.toUpperCase()}</div>
          </div>
        </div>

        <div class="inv-customer-row">
          <div class="inv-cust-info">
            <div class="inv-section-title">BILL TO CUSTOMER</div>
            <div class="inv-cust-name">${invoice.customerName}</div>
            <div>Phone: ${invoice.customerPhone}</div>
            <div>Address: ${invoice.customerAddress || 'Bavla, Gujarat'}</div>
            <div>Doctor: ${invoice.doctorName || 'Dr. V. K. Shah'}</div>
          </div>

          <div class="inv-rx-box">
            <div class="inv-section-title">EYE POWER PRESCRIPTION (Rx)</div>
            <table class="inv-rx-table">
              <thead>
                <tr>
                  <th>Eye</th>
                  <th>SPH</th>
                  <th>CYL</th>
                  <th>AXIS</th>
                  <th>ADD</th>
                  <th>P.D.</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>R.E.</strong></td>
                  <td>${formatRx(rx.rightEye?.sph)}</td>
                  <td>${formatRx(rx.rightEye?.cyl)}</td>
                  <td>${formatAxis(rx.rightEye?.axis)}</td>
                  <td>${formatRx(rx.rightEye?.add)}</td>
                  <td>${formatRx(rx.rightEye?.pd || '31.5')}</td>
                </tr>
                <tr>
                  <td><strong>L.E.</strong></td>
                  <td>${formatRx(rx.leftEye?.sph)}</td>
                  <td>${formatRx(rx.leftEye?.cyl)}</td>
                  <td>${formatAxis(rx.leftEye?.axis)}</td>
                  <td>${formatRx(rx.leftEye?.add)}</td>
                  <td>${formatRx(rx.leftEye?.pd || '31.5')}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <table class="inv-items-table mt-3">
          <thead>
            <tr>
              <th>Description / Specification</th>
              <th style="text-align:center;">Qty</th>
              <th style="text-align:right;">Rate</th>
              <th style="text-align:right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="inv-summary-row mt-3">
          <div class="inv-qr-section">
            ${qrCodeHtml}
          </div>

          <div class="inv-totals-table">
            <div class="inv-total-line">
              <span>Subtotal:</span>
              <span>${Utils.formatCurrency(invoice.subtotal)}</span>
            </div>
            ${invoice.discountAmount > 0 ? `
              <div class="inv-total-line text-success">
                <span>Discount (${invoice.discountPercent}%):</span>
                <span>- ${Utils.formatCurrency(invoice.discountAmount)}</span>
              </div>
            ` : ''}
            ${invoice.gstEnabled ? `
              <div class="inv-total-line">
                <span>CGST (${(invoice.gstPercent / 2)}%):</span>
                <span>+ ${Utils.formatCurrency(invoice.cgstAmount)}</span>
              </div>
              <div class="inv-total-line">
                <span>SGST (${(invoice.gstPercent / 2)}%):</span>
                <span>+ ${Utils.formatCurrency(invoice.sgstAmount)}</span>
              </div>
            ` : ''}
            <div class="inv-total-line inv-grand-total">
              <span>Grand Total:</span>
              <span>${Utils.formatCurrency(invoice.netTotal)}</span>
            </div>
            <div class="inv-total-line">
              <span>Amount Paid (${invoice.paymentMethod}):</span>
              <span>${Utils.formatCurrency(invoice.paidAmount)}</span>
            </div>
            ${invoice.balanceDue > 0 ? `
              <div class="inv-total-line inv-due-line">
                <span>Balance Due:</span>
                <span>${Utils.formatCurrency(invoice.balanceDue)}</span>
              </div>
            ` : ''}
          </div>
        </div>

        <div class="inv-footer-row mt-4">
          <div class="inv-terms">
            <strong>Terms & Conditions:</strong><br>
            ${(shopData.terms || '').replace(/\n/g, '<br>')}
          </div>
          <div class="inv-signature">
            <br><br>
            <div style="border-top:1px solid #334155; width:150px; text-align:center; padding-top:4px; font-weight:600;">
              Authorized Signatory<br>
              <span style="font-size:10px; font-weight:normal;">KHUSHI OPTICS</span>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  async generateWarrantyCard(invoice) {
    const shop = window.db ? await window.db.getSettings() : { shopName: 'KHUSHI OPTICS' };
    const rx = invoice.prescription || { rightEye: {}, leftEye: {} };
    const dateObj = new Date(invoice.date || Date.now());
    const validUntil = new Date(dateObj);
    validUntil.setMonth(validUntil.getMonth() + 6);

    const formatRx = (val) => {
      if (val === undefined || val === null || val === '') return '0.00';
      const str = String(val).trim();
      const num = parseFloat(str);
      if (isNaN(num)) return str;
      let formatted = num.toFixed(2);
      if (str.startsWith('+') && num > 0) formatted = '+' + formatted;
      return formatted;
    };

    const formatAxis = (val) => {
      if (val === undefined || val === null || val === '') return '0°';
      const str = String(val).trim().replace(/[°*]/g, '');
      return str + '°';
    };

    const container = document.getElementById('printableInvoiceContainer');
    if (!container) return;
    container.innerHTML = `
      <div class="invoice-paper" style="max-width:550px; border:2px solid #0284c7; padding:1.75rem; background:#ffffff; box-sizing: border-box;">
        <div style="text-align:center; border-bottom:2px solid #0284c7; padding-bottom:10px; margin-bottom:12px;">
          <h2 style="margin:0; color:#0284c7; font-size:1.5rem; font-weight:800;">${shop.shopName}</h2>
          <div style="font-size:11px; color:#475569;">OFFICIAL EYEWEAR WARRANTY & PRESCRIPTION CARD</div>
          <div style="font-size:10px; color:#64748b; margin-top:2px;">Phone: ${shop.phone1} / ${shop.phone2} | ${shop.address}</div>
        </div>

        <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:10px;">
          <div>Customer: <strong>${invoice.customerName}</strong> (${invoice.customerPhone})</div>
          <div style="text-align:right;">Inv #: <strong>${invoice.invoiceNumber}</strong></div>
        </div>

        <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:6px; padding:8px; margin-bottom:12px; box-sizing: border-box; width: 100%;">
          <div style="font-size:10px; font-weight:bold; color:#0284c7; margin-bottom:4px;">PRESCRIPTION MATRIX (Rx)</div>
          <table style="width:100%; border-collapse:collapse; font-size:11px; text-align:center; table-layout:fixed; box-sizing: border-box;">
            <tr style="background:#e0f2fe; color:#0369a1; font-weight:bold;">
              <td style="padding:4px; box-sizing:border-box;">EYE</td>
              <td style="padding:4px; box-sizing:border-box;">SPH</td>
              <td style="padding:4px; box-sizing:border-box;">CYL</td>
              <td style="padding:4px; box-sizing:border-box;">AXIS</td>
              <td style="padding:4px; box-sizing:border-box;">ADD</td>
            </tr>
            <tr>
              <td style="padding:4px; box-sizing:border-box; border:1px solid #e2e8f0;"><strong>R.E.</strong></td>
              <td style="padding:4px; box-sizing:border-box; border:1px solid #e2e8f0;">${formatRx(rx.rightEye?.sph)}</td>
              <td style="padding:4px; box-sizing:border-box; border:1px solid #e2e8f0;">${formatRx(rx.rightEye?.cyl)}</td>
              <td style="padding:4px; box-sizing:border-box; border:1px solid #e2e8f0;">${formatAxis(rx.rightEye?.axis)}</td>
              <td style="padding:4px; box-sizing:border-box; border:1px solid #e2e8f0;">${formatRx(rx.rightEye?.add)}</td>
            </tr>
            <tr>
              <td style="padding:4px; box-sizing:border-box; border:1px solid #e2e8f0;"><strong>L.E.</strong></td>
              <td style="padding:4px; box-sizing:border-box; border:1px solid #e2e8f0;">${formatRx(rx.leftEye?.sph)}</td>
              <td style="padding:4px; box-sizing:border-box; border:1px solid #e2e8f0;">${formatRx(rx.leftEye?.cyl)}</td>
              <td style="padding:4px; box-sizing:border-box; border:1px solid #e2e8f0;">${formatAxis(rx.leftEye?.axis)}</td>
              <td style="padding:4px; box-sizing:border-box; border:1px solid #e2e8f0;">${formatRx(rx.leftEye?.add)}</td>
            </tr>
          </table>
        </div>

        <div style="background:#f0fdf4; border:1px solid #86efac; padding:8px; border-radius:6px; font-size:11px; color:#166534; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <strong>6 Months Frame Warranty Valid Until:</strong><br>
            <span style="font-size:13px; font-weight:bold;">${Utils.formatDate(validUntil)}</span>
          </div>
          <div style="text-align:right; font-size:9px; color:#15803d;">
            *Covers manufacturing defects.<br>Lens breakage excluded.
          </div>
        </div>

        <div style="margin-top:15px; text-align:center;">
          ${Utils.generateBarcodeSVG(invoice.invoiceNumber)}
        </div>
      </div>
    `;

    Utils.showToast('Pocket Warranty & Rx Card rendered!', 'info');
  },

  async printInvoiceAction() {
    Utils.showToast('Preparing invoice for print...', 'info');
    
    const container = document.getElementById('printableInvoiceContainer');
    if (container) {
      const images = container.querySelectorAll('img');
      const promises = Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      });
      await Promise.all(promises);
    }

    setTimeout(() => {
      if (window.electronAPI && window.electronAPI.printInvoice) {
        window.electronAPI.printInvoice();
      } else {
        window.print();
      }
    }, 150);
  },

  async downloadInvoicePDF(invoice) {
    Utils.showToast('Generating high-quality A4 PDF...', 'info');
    const sourceEl = document.getElementById('invoicePaper') || document.getElementById('printableInvoiceContainer');

    if (window.html2pdf && sourceEl) {
      const images = sourceEl.querySelectorAll('img');
      const promises = Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      });
      await Promise.all(promises);

      const parentNode = sourceEl.parentNode;
      const nextSibling = sourceEl.nextSibling;
      
      const originalCss = sourceEl.style.cssText;
      sourceEl.style.position = 'absolute';
      sourceEl.style.top = '0';
      sourceEl.style.left = '0';
      sourceEl.style.zIndex = '999999';
      sourceEl.style.width = '210mm';
      sourceEl.style.background = '#ffffff';
      
      document.body.appendChild(sourceEl);

      const cleanInvNumber = (invoice && invoice.invoiceNumber) ? invoice.invoiceNumber.replace(/[^a-zA-Z0-9]/g, '-') : 'Bill';
      const opt = {
        margin: 0,
        filename: `Invoice-KO-${cleanInvNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      setTimeout(() => {
        window.html2pdf().set(opt).from(sourceEl).save().then(() => {
          sourceEl.style.cssText = originalCss;
          if (nextSibling) {
            parentNode.insertBefore(sourceEl, nextSibling);
          } else {
            parentNode.appendChild(sourceEl);
          }
          Utils.showToast(`Invoice-KO-${cleanInvNumber}.pdf downloaded successfully!`, 'success');
        }).catch(err => {
          console.error('PDF generation error:', err);
          sourceEl.style.cssText = originalCss;
          parentNode.appendChild(sourceEl);
          Utils.showToast('PDF generation failed. Opening print dialog...', 'warning');
          window.print();
        });
      }, 250);
    } else {
      Utils.showToast('PDF generator unavailable. Opening print dialog...', 'info');
      window.print();
    }
  },

  async autoSavePDFToFile(invoice) {
    if (window.electronAPI && window.electronAPI.saveInvoicePDF) {
      try {
        const sourceEl = document.getElementById('invoicePaper') || document.getElementById('printableInvoiceContainer');
        if (sourceEl && window.html2pdf) {
          const images = sourceEl.querySelectorAll('img');
          const promises = Array.from(images).map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise(resolve => { img.onload = resolve; img.onerror = resolve; });
          });
          await Promise.all(promises);

          const parentNode = sourceEl.parentNode;
          const nextSibling = sourceEl.nextSibling;
          const originalCss = sourceEl.style.cssText;
          
          sourceEl.style.position = 'absolute';
          sourceEl.style.top = '0';
          sourceEl.style.left = '0';
          sourceEl.style.zIndex = '999999';
          sourceEl.style.width = '210mm';
          sourceEl.style.background = '#ffffff';
          document.body.appendChild(sourceEl);

          const opt = {
            margin: 0,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
          };

          setTimeout(() => {
            window.html2pdf().set(opt).from(sourceEl).outputPdf('datauristring').then(async (pdfBase64) => {
              sourceEl.style.cssText = originalCss;
              if (nextSibling) parentNode.insertBefore(sourceEl, nextSibling);
              else parentNode.appendChild(sourceEl);

              const cleanInvNumber = (invoice.invoiceNumber || 'Bill').replace(/[^a-zA-Z0-9]/g, '-');
              const fileName = `Invoice-KO-${cleanInvNumber}.pdf`;
              const base64Data = pdfBase64.split(',')[1];

              const res = await window.electronAPI.saveInvoicePDF(base64Data, fileName);
              if (res && res.success) {
                console.log('PDF auto-saved:', res.filePath);
              }
            }).catch(err => {
              sourceEl.style.cssText = originalCss;
              parentNode.appendChild(sourceEl);
              console.error('AutoSave PDF err:', err);
            });
          }, 250);
        }
      } catch (err) {
        console.error('Failed to auto-save PDF via html2pdf:', err);
      }
    }
  },

  shareWhatsAppInvoice(invoice) {
    const text = `*KHUSHI OPTICS - Invoice ${invoice.invoiceNumber}*\n` +
      `Dear ${invoice.customerName},\n` +
      `Thank you for your visit! Here are your bill details:\n\n` +
      `*Total Amount:* ${Utils.formatCurrency(invoice.netTotal)}\n` +
      `*Paid Amount:* ${Utils.formatCurrency(invoice.paidAmount)}\n` +
      (invoice.balanceDue > 0 ? `*Balance Due:* ${Utils.formatCurrency(invoice.balanceDue)}\n` : '') +
      `\nFor any queries, call us at 9824735065 / 9265778527.\n` +
      `KHUSHI OPTICS, Krishna Complex, Bavla.`;

    const cleanPhone = invoice.customerPhone.replace(/[^0-9]/g, '');
    const fullPhone = cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone;
    const url = `https://wa.me/${fullPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }
};

window.Billing = Billing;
