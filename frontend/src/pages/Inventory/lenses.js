/**
 * KHUSHI OPTICS - Lens Inventory Controller
 */

import { Utils } from '../../utils/utils.js';

export const Lenses = {
  async render() {
    this.renderLensTable();
  },
  async renderLensTable(filterQuery = '') {
    const lenses = window.db ? await window.db.getLenses() : [];
    const tbody = document.getElementById('lensesTbody');
    if (!tbody) return;

    const q = filterQuery.toLowerCase();
    const filtered = lenses.filter(l => 
      l.company.toLowerCase().includes(q) ||
      l.type.toLowerCase().includes(q) ||
      l.id.toLowerCase().includes(q) ||
      (l.index && l.index.toLowerCase().includes(q))
    );

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No lenses found in catalog</td></tr>`;
      return;
    }

    let html = '';
    filtered.forEach(l => {
      const qty = parseInt(l.quantity || 0);
      const minAlert = parseInt(l.minAlertQty || 3);

      let stockBadge = `<span class="badge badge-success">${qty} in stock</span>`;
      if (qty <= 0) stockBadge = `<span class="badge badge-danger">Out of stock</span>`;
      else if (qty <= minAlert) stockBadge = `<span class="badge badge-warning">Low (${qty})</span>`;

      const featuresList = (l.features || []).map(f => `<span class="badge badge-info text-xs">${f}</span>`).join(' ');

      html += `
        <tr>
          <td><strong>${l.id}</strong></td>
          <td>
            <strong>${l.company}</strong>
            <div class="text-muted text-xs">${l.index || 'Standard Index'}</div>
          </td>
          <td><span class="badge badge-primary">${l.type}</span></td>
          <td>${featuresList || 'Standard'}</td>
          <td>${Utils.formatCurrency(l.purchasePrice)}</td>
          <td><strong class="text-primary">${Utils.formatCurrency(l.sellingPrice)}</strong></td>
          <td>${stockBadge}</td>
          <td>
            <div class="btn-group">
              <button class="btn btn-sm btn-secondary" title="Edit Lens" onclick="window.Lenses.openEditLensModal('${l.id}')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="btn btn-sm btn-danger" title="Delete" onclick="window.Lenses.deleteLens('${l.id}')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  },

  async openAddLensModal() {
    const form = document.getElementById('lensModalForm');
    if (form) form.reset();
    const title = document.getElementById('lensModalTitle');
    const id = document.getElementById('lensModalId');
    if (title) title.textContent = 'Add New Lens';
    if (id) id.value = '';
    Utils.openModal('lensModal');
  },
  async openEditLensModal(id) {
    const lens = window.db ? await window.db.getLensById(id) : null;
    if (!lens) return;

    const title = document.getElementById('lensModalTitle');
    if (title) title.textContent = 'Edit Lens Specifications';
    document.getElementById('lensModalId').value = lens.id;
    document.getElementById('lensCompany').value = lens.company;
    document.getElementById('lensType').value = lens.type || 'Single Vision';
    document.getElementById('lensIndex').value = lens.index || '';
    document.getElementById('lensPurchasePrice').value = lens.purchasePrice || 0;
    document.getElementById('lensSellingPrice').value = lens.sellingPrice || 0;
    document.getElementById('lensQuantity').value = lens.quantity || 1;

    const feats = lens.features || [];
    const cbBlue = document.getElementById('featBlueCut');
    const cbPhoto = document.getElementById('featPhotochromic');
    const cbAnti = document.getElementById('featAntiGlare');
    const cbHigh = document.getElementById('featHighIndex');
    if (cbBlue) cbBlue.checked = feats.includes('Blue Cut');
    if (cbPhoto) cbPhoto.checked = feats.includes('Photochromic');
    if (cbAnti) cbAnti.checked = feats.includes('Anti Glare');
    if (cbHigh) cbHigh.checked = feats.includes('High Index');

    Utils.openModal('lensModal');
  },
  async saveLensFromForm() {
    const company = document.getElementById('lensCompany').value.trim();
    const type = document.getElementById('lensType').value;
    const sellingPrice = parseFloat(document.getElementById('lensSellingPrice').value) || 0;

    if (!company || sellingPrice <= 0) {
      Utils.showToast('Please enter Lens Company and Selling Price', 'warning');
      return;
    }

    const features = [];
    const cbBlue = document.getElementById('featBlueCut');
    const cbPhoto = document.getElementById('featPhotochromic');
    const cbAnti = document.getElementById('featAntiGlare');
    const cbHigh = document.getElementById('featHighIndex');

    if (cbBlue && cbBlue.checked) features.push('Blue Cut');
    if (cbPhoto && cbPhoto.checked) features.push('Photochromic');
    if (cbAnti && cbAnti.checked) features.push('Anti Glare');
    if (cbHigh && cbHigh.checked) features.push('High Index');

    const lensData = {
      id: document.getElementById('lensModalId').value || undefined,
      company,
      type,
      index: document.getElementById('lensIndex').value.trim(),
      features,
      purchasePrice: parseFloat(document.getElementById('lensPurchasePrice').value) || 0,
      sellingPrice,
      quantity: parseInt(document.getElementById('lensQuantity').value) || 0
    };

    if (window.db) window.db.saveLens(lensData);
    Utils.closeModal('lensModal');
    Utils.showToast(`Lens ${company} (${type}) saved!`, 'success');
    this.renderLensTable();
  },
  async deleteLens(id) {
    const role = sessionStorage.getItem('khushi_user_role') || (window.db?.getAdmin()?.role) || 'Admin';
    if (role === 'Staff') {
      Utils.showToast('Access Denied: Staff accounts cannot delete inventory items.', 'error');
      return;
    }
    if (confirm('Delete this lens from inventory?')) {
      if (window.db) window.db.deleteLens(id);
      Utils.showToast('Lens removed', 'info');
      this.renderLensTable();
    }
  },
  async exportLensesExcel() {
    const lenses = window.db ? await window.db.getLenses() : [];
    if (!lenses.length) return Utils.showToast('No lenses in stock to export', 'warning');
    const rows = lenses.map(l => ({
      'Lens ID': l.id, 'Brand / Company': l.company, 'Type': l.type, 'Features': (l.features || []).join(', '), 'Index': l.index || '', 'Selling Price (₹)': l.sellingPrice || 0, 'Stock Qty': l.quantity || 0
    }));
    Utils.exportToExcel(`KHUSHI_OPTICS_Lenses_Inventory_${new Date().toISOString().slice(0, 10)}.xlsx`, rows, 'Lenses Inventory');
  },
  async exportLensesCSV() {
    const lenses = window.db ? await window.db.getLenses() : [];
    if (!lenses.length) return Utils.showToast('No lenses to export', 'warning');
    const rows = lenses.map(l => ({ ID: l.id, Company: l.company, Type: l.type, Features: (l.features || []).join(', '), Price: l.sellingPrice, Qty: l.quantity }));
    Utils.exportToCSV(`KHUSHI_OPTICS_Lenses_Inventory_${new Date().toISOString().slice(0, 10)}.csv`, rows);
  }
};

window.Lenses = Lenses;
