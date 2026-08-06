/**
 * KHUSHI OPTICS - 8-Step POS Billing & Invoice Engine
 * Features Official KHUSHI OPTICS Google Pay QR Code Payment display during checkout!
 */

const Billing = {
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

  render() {
    this.populateCustomerDropdown();
    this.populateFrameDropdown();
    this.populateLensDropdown();
    this.recalculateTotals();
  },

  startNewBillForCustomer(customerId) {
    App.navigateTo('billingView');
    setTimeout(() => {
      const select = document.getElementById('posCustomerSelect');
      if (select) {
        select.value = customerId;
        this.handleCustomerSelection(customerId);
      }
    }, 100);
  },

  populateCustomerDropdown() {
    const customers = window.db.getCustomers();
    const select = document.getElementById('posCustomerSelect');
    if (!select) return;

    let html = `<option value="">-- Select Existing Customer --</option>`;
    customers.forEach(c => {
      html += `<option value="${c.id}">${c.name} (${c.mobile}) - ID: ${c.id}</option>`;
    });
    select.innerHTML = html;
  },

  populateFrameDropdown() {
    const frames = window.db.getFrames();
    const select = document.getElementById('posFrameSelect');
    if (!select) return;

    let html = `<option value="">-- Select Frame from Inventory --</option>`;
    frames.forEach(f => {
      const isLow = f.quantity <= f.minAlertQty ? ' [LOW STOCK]' : '';
      html += `<option value="${f.id}" ${f.quantity <= 0 ? 'disabled' : ''}>${f.brand} ${f.model} (${f.type}) - ${Utils.formatCurrency(f.sellingPrice)}${isLow}</option>`;
    });
    select.innerHTML = html;
  },

  populateLensDropdown() {
    const lenses = window.db.getLenses();
    const select = document.getElementById('posLensSelect');
    if (!select) return;

    let html = `<option value="">-- Select Lens Type --</option>`;
    lenses.forEach(l => {
      const feats = (l.features || []).join(', ');
      html += `<option value="${l.id}">${l.company} - ${l.type} (${l.index}) [${feats}] - ${Utils.formatCurrency(l.sellingPrice)}</option>`;
    });
    select.innerHTML = html;
  },

  handleCustomerSelection(customerId) {
    if (!customerId) {
      this.activeInvoice.customer = null;
      document.getElementById('posCustomerDetailsCard').style.display = 'none';
      return;
    }

    const customer = window.db.getCustomerById(customerId);
    if (customer) {
      this.activeInvoice.customer = customer;
      const detailsCard = document.getElementById('posCustomerDetailsCard');
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
  },

  handleFrameSelection(frameId) {
    if (!frameId) {
      this.activeInvoice.selectedFrame = null;
      document.getElementById('posFramePriceDisplay').textContent = '₹0.00';
    } else {
      const frame = window.db.getFrameById(frameId);
      if (frame) {
        this.activeInvoice.selectedFrame = frame;
        document.getElementById('posFramePriceDisplay').textContent = Utils.formatCurrency(frame.sellingPrice);
      }
    }
    this.recalculateTotals();
  },

  handleLensSelection(lensId) {
    if (!lensId) {
      this.activeInvoice.selectedLens = null;
      document.getElementById('posLensPriceDisplay').textContent = '₹0.00';
    } else {
      const lens = window.db.getLensById(lensId);
      if (lens) {
        this.activeInvoice.selectedLens = lens;
        document.getElementById('posLensPriceDisplay').textContent = Utils.formatCurrency(lens.sellingPrice);
      }
    }
    this.recalculateTotals();
  },

  handlePaymentMethodChange(method) {
    const qrContainer = document.getElementById('posUpiQrPreviewCard');
    if (qrContainer) {
      if (method === 'UPI') {
        qrContainer.style.display = 'block';
      } else {
        qrContainer.style.display = 'none';
      }
    }
    this.recalculateTotals();
  },

  showUPIQRModal() {
    const netTotal = this.activeInvoice.netTotal || 0;
    document.getElementById('upiQrModalAmount').textContent = Utils.formatCurrency(netTotal);
    Utils.openModal('upiQrModal');
  },

  recalculateTotals() {
    const framePrice = this.activeInvoice.selectedFrame ? parseFloat(this.activeInvoice.selectedFrame.sellingPrice) : 0;
    const lensPrice = this.activeInvoice.selectedLens ? parseFloat(this.activeInvoice.selectedLens.sellingPrice) : 0;
    const extraPrice = parseFloat(document.getElementById('posExtraChargesInput')?.value) || 0;

    const subtotal = framePrice + lensPrice + extraPrice;
    document.getElementById('posSubtotalDisplay').textContent = Utils.formatCurrency(subtotal);

    // Discount Calculation
    const discountSelect = document.getElementById('posDiscountSelect')?.value || '0';
    let discountPercent = 0;

    if (discountSelect === 'custom') {
      document.getElementById('posCustomDiscountGroup').style.display = 'block';
      discountPercent = parseFloat(document.getElementById('posCustomDiscountInput')?.value) || 0;
    } else {
      document.getElementById('posCustomDiscountGroup').style.display = 'none';
      discountPercent = parseFloat(discountSelect) || 0;
    }

    const discountAmount = (subtotal * discountPercent) / 100;
    const afterDiscount = Math.max(0, subtotal - discountAmount);

    document.getElementById('posDiscountAmountDisplay').textContent = `- ${Utils.formatCurrency(discountAmount)}`;

    // GST Calculation
    const gstToggle = document.getElementById('posGstToggle')?.checked;
    let gstPercent = parseFloat(document.getElementById('posGstPercentSelect')?.value) || 12;
    let cgst = 0;
    let sgst = 0;
    let totalGst = 0;

    if (gstToggle) {
      totalGst = (afterDiscount * gstPercent) / 100;
      cgst = totalGst / 2;
      sgst = totalGst / 2;
      document.getElementById('posGstRow').style.display = 'flex';
      document.getElementById('posGstAmountDisplay').textContent = `+ ${Utils.formatCurrency(totalGst)} (CGST ${cgst.toFixed(2)} + SGST ${sgst.toFixed(2)})`;
    } else {
      document.getElementById('posGstRow').style.display = 'none';
    }

    const netTotal = Math.round(afterDiscount + totalGst);
    document.getElementById('posNetTotalDisplay').textContent = Utils.formatCurrency(netTotal);

    // Payment & Balance Due
    const paidInput = document.getElementById('posPaidAmountInput');
    let paidAmount = parseFloat(paidInput?.value);
    if (isNaN(paidAmount)) {
      paidAmount = netTotal;
      if (paidInput) paidInput.value = netTotal;
    }

    const balanceDue = Math.max(0, netTotal - paidAmount);
    document.getElementById('posBalanceDueDisplay').textContent = Utils.formatCurrency(balanceDue);

    const paymentStatusBadge = document.getElementById('posPaymentStatusBadge');
    if (paymentStatusBadge) {
      if (balanceDue <= 0) {
        paymentStatusBadge.className = 'badge badge-success';
        paymentStatusBadge.textContent = 'Full Payment (Paid)';
        document.getElementById('posDueDateGroup').style.display = 'none';
      } else {
        paymentStatusBadge.className = 'badge badge-warning';
        paymentStatusBadge.textContent = `Credit/Due: ${Utils.formatCurrency(balanceDue)}`;
        document.getElementById('posDueDateGroup').style.display = 'block';
      }
    }

    // Save state
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

  generateAndSaveInvoice() {
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
      window.db.updateFrameStock(this.activeInvoice.selectedFrame.id, -1);
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
      window.db.updateLensStock(this.activeInvoice.selectedLens.id, -1);
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

    const invoiceRecord = {
      date: new Date().toISOString(),
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

    const savedInvoice = window.db.saveInvoice(invoiceRecord);
    Utils.showToast(`Invoice ${savedInvoice.invoiceNumber} generated!`, 'success');

    this.viewInvoiceDetails(savedInvoice.invoiceNumber);
    this.autoSavePDFToFile(savedInvoice);
    this.resetBillingForm();
  },

  resetBillingForm() {
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

    document.getElementById('posCustomerSelect').value = '';
    document.getElementById('posFrameSelect').value = '';
    document.getElementById('posLensSelect').value = '';
    document.getElementById('posExtraChargesInput').value = '';
    document.getElementById('posDiscountSelect').value = '0';
    document.getElementById('posCustomDiscountInput').value = '';
    document.getElementById('posRemarksInput').value = '';
    document.getElementById('posCustomerDetailsCard').style.display = 'none';
    document.getElementById('posUpiQrPreviewCard').style.display = 'none';

    this.recalculateTotals();
  },

  viewInvoiceDetails(invoiceNumber) {
    const invoice = window.db.getInvoiceByNumber(invoiceNumber);
    if (!invoice) return;

    const shop = window.db.getSettings();
    const container = document.getElementById('printableInvoiceContainer');
    if (!container) return;

    const rx = invoice.prescription || { rightEye: {}, leftEye: {} };
    const dateFormatted = Utils.formatDateTime(invoice.date);

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

    const qrCodeHtml = Utils.generateUPIQRCode(shop.phone1 + '@upi', shop.shopName, invoice.netTotal, invoice.invoiceNumber);

    container.innerHTML = `
      <div class="invoice-paper" id="invoicePaper">
        <!-- Header -->
        <div class="inv-header">
          <div class="inv-brand">
            <h2>${shop.shopName}</h2>
            <div class="inv-sub font-mono">${shop.address}</div>
            <div class="inv-sub">Phone: <strong>${shop.phone1}</strong> / <strong>${shop.phone2}</strong></div>
          </div>
          <div class="inv-meta">
            <div class="inv-title">TAX INVOICE</div>
            <div class="inv-num">Inv #: <strong>${invoice.invoiceNumber}</strong></div>
            <div class="inv-date">Date: ${dateFormatted}</div>
            <div class="inv-status-tag ${invoice.balanceDue <= 0 ? 'paid' : 'due'}">${invoice.paymentStatus.toUpperCase()}</div>
          </div>
        </div>

        <!-- Customer & Rx Row -->
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
                  <td>${rx.rightEye?.sph || '0.00'}</td>
                  <td>${rx.rightEye?.cyl || '0.00'}</td>
                  <td>${rx.rightEye?.axis || '0'}°</td>
                  <td>${rx.rightEye?.add || '0.00'}</td>
                  <td>${rx.rightEye?.pd || '31.5'}</td>
                </tr>
                <tr>
                  <td><strong>L.E.</strong></td>
                  <td>${rx.leftEye?.sph || '0.00'}</td>
                  <td>${rx.leftEye?.cyl || '0.00'}</td>
                  <td>${rx.leftEye?.axis || '0'}°</td>
                  <td>${rx.leftEye?.add || '0.00'}</td>
                  <td>${rx.leftEye?.pd || '31.5'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Items Table -->
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

        <!-- Summary & QR -->
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
                <span>CGST (${(invoice.gstPercent/2)}%):</span>
                <span>+ ${Utils.formatCurrency(invoice.cgstAmount)}</span>
              </div>
              <div class="inv-total-line">
                <span>SGST (${(invoice.gstPercent/2)}%):</span>
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

        <!-- Footer & Sign -->
        <div class="inv-footer-row mt-4">
          <div class="inv-terms">
            <strong>Terms & Conditions:</strong><br>
            ${(shop.terms || '').replace(/\n/g, '<br>')}
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

    document.getElementById('invoiceModalPrintBtn').onclick = () => this.printInvoice();
    document.getElementById('invoiceModalPdfBtn').onclick = () => this.downloadInvoicePDF(invoice);
    document.getElementById('invoiceModalWhatsappBtn').onclick = () => this.shareWhatsAppInvoice(invoice);

    let warrantyBtn = document.getElementById('invoiceModalWarrantyBtn');
    if (!warrantyBtn) {
      warrantyBtn = document.createElement('button');
      warrantyBtn.id = 'invoiceModalWarrantyBtn';
      warrantyBtn.className = 'btn btn-secondary';
      warrantyBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> Warranty Card`;
      document.querySelector('#invoiceModal .modal-footer').insertBefore(warrantyBtn, document.getElementById('invoiceModalPrintBtn'));
    }
    warrantyBtn.onclick = () => this.generateWarrantyCard(invoice);

    Utils.openModal('invoiceModal');
  },

  generateWarrantyCard(invoice) {
    const shop = window.db.getSettings();
    const rx = invoice.prescription || { rightEye: {}, leftEye: {} };
    const dateObj = new Date(invoice.date || Date.now());
    const validUntil = new Date(dateObj);
    validUntil.setMonth(validUntil.getMonth() + 6);

    const container = document.getElementById('printableInvoiceContainer');
    container.innerHTML = `
      <div class="invoice-paper" style="max-width:550px; border:2px solid #0284c7; padding:1.75rem; background:#ffffff;">
        <div style="text-align:center; border-bottom:2px solid #0284c7; padding-bottom:10px; margin-bottom:12px;">
          <h2 style="margin:0; color:#0284c7; font-size:1.5rem; font-weight:800;">${shop.shopName}</h2>
          <div style="font-size:11px; color:#475569;">OFFICIAL EYEWEAR WARRANTY & PRESCRIPTION CARD</div>
          <div style="font-size:10px; color:#64748b; margin-top:2px;">Phone: ${shop.phone1} / ${shop.phone2} | ${shop.address}</div>
        </div>

        <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:10px;">
          <div>Customer: <strong>${invoice.customerName}</strong> (${invoice.customerPhone})</div>
          <div style="text-align:right;">Inv #: <strong>${invoice.invoiceNumber}</strong></div>
        </div>

        <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:6px; padding:8px; margin-bottom:12px;">
          <div style="font-size:10px; font-weight:bold; color:#0284c7; margin-bottom:4px;">PRESCRIPTION MATRIX (Rx)</div>
          <table style="width:100%; border-collapse:collapse; font-size:11px; text-align:center;">
            <tr style="background:#e0f2fe; color:#0369a1; font-weight:bold;">
              <td>EYE</td><td>SPH</td><td>CYL</td><td>AXIS</td><td>ADD</td>
            </tr>
            <tr>
              <td><strong>R.E.</strong></td><td>${rx.rightEye?.sph || '0.00'}</td><td>${rx.rightEye?.cyl || '0.00'}</td><td>${rx.rightEye?.axis || '0'}°</td><td>${rx.rightEye?.add || '0.00'}</td>
            </tr>
            <tr>
              <td><strong>L.E.</strong></td><td>${rx.leftEye?.sph || '0.00'}</td><td>${rx.leftEye?.cyl || '0.00'}</td><td>${rx.leftEye?.axis || '0'}°</td><td>${rx.leftEye?.add || '0.00'}</td>
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

  printInvoice() {
    if (window.electronAPI && window.electronAPI.printInvoice) {
      window.electronAPI.printInvoice();
    } else {
      window.print();
    }
  },

  async downloadInvoicePDF(invoice) {
    Utils.showToast('Generating PDF...', 'info');
    const paper = document.getElementById('invoicePaper');
    
    if (window.html2pdf) {
      const opt = {
        margin:       0.3,
        filename:     `Invoice_${invoice.invoiceNumber}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      window.html2pdf().set(opt).from(paper).save();
    } else {
      window.print();
    }
  },

  async autoSavePDFToFile(invoice) {
    if (window.electronAPI && window.electronAPI.saveInvoicePDF) {
      try {
        const paper = document.getElementById('invoicePaper');
        if (paper && window.html2pdf) {
          const pdfDataUri = await window.html2pdf().from(paper).outputPdf('datauristring');
          const res = await window.electronAPI.saveInvoicePDF({
            invoiceNumber: invoice.invoiceNumber,
            base64Data: pdfDataUri,
            dateStr: invoice.date
          });
          if (res.success) {
            Utils.showToast(`Invoice saved to Documents: ${res.path}`, 'success');
          }
        }
      } catch (err) {
        console.error('Auto save PDF failed:', err);
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
