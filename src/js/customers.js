/**
 * KHUSHI OPTICS - Customer Management & Eye Prescription Controller
 */

const Customers = {
  activeCustomerId: null,

  render() {
    this.renderCustomerTable();
  },

  renderCustomerTable(filterQuery = '') {
    const customers = window.db.getCustomers();
    const tbody = document.getElementById('customersTbody');
    if (!tbody) return;

    const q = filterQuery.toLowerCase();
    const filtered = customers.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.mobile.includes(q) || 
      (c.address && c.address.toLowerCase().includes(q))
    );

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No customers found</td></tr>`;
      return;
    }

    let html = '';
    filtered.forEach(c => {
      const rx = c.prescription || { rightEye: {}, leftEye: {} };
      const rxSummary = `RE: ${rx.rightEye.sph || '0.00'}/${rx.rightEye.cyl || '0.00'} | LE: ${rx.leftEye.sph || '0.00'}/${rx.leftEye.cyl || '0.00'}`;

      html += `
        <tr>
          <td><strong>${c.id}</strong></td>
          <td>
            <div class="customer-name-cell">
              <strong>${c.name}</strong>
              <div class="text-muted text-xs">${c.gender || 'N/A'}, ${c.age || 'N/A'} yrs</div>
            </div>
          </td>
          <td><strong>${c.mobile}</strong></td>
          <td>${c.address || 'Bavla'}</td>
          <td><span class="badge badge-info">${rxSummary}</span></td>
          <td>${c.doctorName || 'Dr. V. K. Shah'}</td>
          <td>
            <div class="btn-group">
              <button class="btn btn-sm btn-primary" title="View Prescription & History" onclick="Customers.viewCustomerHistory('${c.id}')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                Rx & Bills
              </button>
              <button class="btn btn-sm btn-secondary" title="Edit Customer" onclick="Customers.openEditCustomerModal('${c.id}')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="btn btn-sm btn-danger" title="Delete" onclick="Customers.deleteCustomer('${c.id}')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  },

  openAddCustomerModal() {
    this.activeCustomerId = null;
    const form = document.getElementById('customerModalForm');
    if (form) form.reset();
    document.getElementById('customerModalTitle').textContent = 'Add New Customer & Eye Power';
    document.getElementById('custModalId').value = '';
    Utils.openModal('customerModal');
  },

  openEditCustomerModal(id) {
    const customer = window.db.getCustomerById(id);
    if (!customer) return;

    this.activeCustomerId = id;
    document.getElementById('customerModalTitle').textContent = 'Edit Customer & Prescription';
    document.getElementById('custModalId').value = customer.id;
    document.getElementById('custName').value = customer.name;
    document.getElementById('custMobile').value = customer.mobile;
    document.getElementById('custAddress').value = customer.address || '';
    document.getElementById('custAge').value = customer.age || '';
    document.getElementById('custGender').value = customer.gender || 'Male';
    document.getElementById('custDoctor').value = customer.doctorName || '';
    document.getElementById('custRemarks').value = customer.remarks || '';

    const rx = customer.prescription || { rightEye: {}, leftEye: {} };
    document.getElementById('reSph').value = rx.rightEye.sph || '0.00';
    document.getElementById('reCyl').value = rx.rightEye.cyl || '0.00';
    document.getElementById('reAxis').value = rx.rightEye.axis || '0';
    document.getElementById('reAdd').value = rx.rightEye.add || '0.00';
    document.getElementById('rePd').value = rx.rightEye.pd || '31.5';

    document.getElementById('leSph').value = rx.leftEye.sph || '0.00';
    document.getElementById('leCyl').value = rx.leftEye.cyl || '0.00';
    document.getElementById('leAxis').value = rx.leftEye.axis || '0';
    document.getElementById('leAdd').value = rx.leftEye.add || '0.00';
    document.getElementById('lePd').value = rx.leftEye.pd || '31.5';

    Utils.openModal('customerModal');
  },

  saveCustomerFromForm() {
    const name = document.getElementById('custName').value.trim();
    const mobile = document.getElementById('custMobile').value.trim();

    if (!name || !mobile) {
      Utils.showToast('Please enter Customer Name and Mobile Number', 'warning');
      return;
    }

    const customerData = {
      id: document.getElementById('custModalId').value || undefined,
      name,
      mobile,
      address: document.getElementById('custAddress').value.trim(),
      age: parseInt(document.getElementById('custAge').value) || '',
      gender: document.getElementById('custGender').value,
      doctorName: document.getElementById('custDoctor').value.trim(),
      remarks: document.getElementById('custRemarks').value.trim(),
      prescription: {
        rightEye: {
          sph: document.getElementById('reSph').value || '0.00',
          cyl: document.getElementById('reCyl').value || '0.00',
          axis: document.getElementById('reAxis').value || '0',
          add: document.getElementById('reAdd').value || '0.00',
          pd: document.getElementById('rePd').value || '31.5'
        },
        leftEye: {
          sph: document.getElementById('leSph').value || '0.00',
          cyl: document.getElementById('leCyl').value || '0.00',
          axis: document.getElementById('leAxis').value || '0',
          add: document.getElementById('leAdd').value || '0.00',
          pd: document.getElementById('lePd').value || '31.5'
        }
      }
    };

    window.db.saveCustomer(customerData);
    Utils.closeModal('customerModal');
    Utils.showToast(`Customer ${name} saved successfully!`, 'success');
    this.renderCustomerTable();
  },

  deleteCustomer(id) {
    if (confirm('Are you sure you want to delete this customer?')) {
      window.db.deleteCustomer(id);
      Utils.showToast('Customer removed', 'info');
      this.renderCustomerTable();
    }
  },

  viewCustomerHistory(id) {
    const customer = window.db.getCustomerById(id);
    if (!customer) return;

    const invoices = window.db.getInvoices().filter(inv => inv.customerId === id || inv.customerPhone === customer.mobile);
    const modalBody = document.getElementById('customerHistoryModalBody');
    if (!modalBody) return;

    const rx = customer.prescription || { rightEye: {}, leftEye: {} };

    let billsHtml = '';
    if (invoices.length === 0) {
      billsHtml = `<div class="text-muted p-3">No billing history found for this customer.</div>`;
    } else {
      billsHtml = `
        <table class="data-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Date</th>
              <th>Total</th>
              <th>Paid</th>
              <th>Balance</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${invoices.map(inv => `
              <tr>
                <td><strong>${inv.invoiceNumber}</strong></td>
                <td>${Utils.formatDate(inv.date)}</td>
                <td>${Utils.formatCurrency(inv.netTotal)}</td>
                <td>${Utils.formatCurrency(inv.paidAmount)}</td>
                <td>${Utils.formatCurrency(inv.balanceDue)}</td>
                <td><span class="badge ${inv.balanceDue > 0 ? 'badge-warning' : 'badge-success'}">${inv.balanceDue > 0 ? 'Pending' : 'Paid'}</span></td>
                <td>
                  <button class="btn btn-sm btn-secondary" onclick="Utils.closeModal('customerHistoryModal'); window.Billing.viewInvoiceDetails('${inv.invoiceNumber}');">
                    View Bill
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    modalBody.innerHTML = `
      <div class="cust-history-header">
        <div>
          <h3 class="m-0">${customer.name}</h3>
          <div class="text-muted">${customer.mobile} | ${customer.address || 'Bavla'}</div>
          <div class="text-xs text-muted mt-1">Doctor: ${customer.doctorName || 'Dr. V. K. Shah'} | Remarks: ${customer.remarks || 'None'}</div>
        </div>
        <button class="btn btn-primary btn-sm" onclick="Utils.closeModal('customerHistoryModal'); window.Billing.startNewBillForCustomer('${customer.id}');">
          + Create New Bill
        </button>
      </div>

      <div class="card mt-3 p-3">
        <h4 class="card-title text-sm"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg> Eye Power Prescription (Rx)</h4>
        <div class="rx-matrix-display mt-2">
          <table class="rx-table">
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
                <td><strong>Right Eye (R.E. / OD)</strong></td>
                <td>${rx.rightEye?.sph || '0.00'}</td>
                <td>${rx.rightEye?.cyl || '0.00'}</td>
                <td>${rx.rightEye?.axis || '0'}°</td>
                <td>${rx.rightEye?.add || '0.00'}</td>
                <td>${rx.rightEye?.pd || '31.5'} mm</td>
              </tr>
              <tr>
                <td><strong>Left Eye (L.E. / OS)</strong></td>
                <td>${rx.leftEye?.sph || '0.00'}</td>
                <td>${rx.leftEye?.cyl || '0.00'}</td>
                <td>${rx.leftEye?.axis || '0'}°</td>
                <td>${rx.leftEye?.add || '0.00'}</td>
                <td>${rx.leftEye?.pd || '31.5'} mm</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="mt-4">
        <h4 class="card-title text-sm">Purchase & Invoice History (${invoices.length})</h4>
        ${billsHtml}
      </div>
    `;

    Utils.openModal('customerHistoryModal');
  }
};

window.Customers = Customers;
