/**
 * KHUSHI OPTICS - Frame Inventory Controller
 */

import { Utils } from '../../utils/utils.js';

export const Frames = {
  async render() {
    this.renderFrameTable();
  },
  async renderFrameTable(filterQuery = '') {
    const frames = window.db ? await window.db.getFrames() : [];
    const tbody = document.getElementById('framesTbody');
    if (!tbody) return;

    const q = filterQuery.toLowerCase();
    const filtered = frames.filter(f => 
      f.brand.toLowerCase().includes(q) ||
      f.model.toLowerCase().includes(q) ||
      f.id.toLowerCase().includes(q) ||
      (f.color && f.color.toLowerCase().includes(q)) ||
      (f.barcode && f.barcode.includes(q))
    );

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">No frames found in inventory</td></tr>`;
      return;
    }

    let html = '';
    filtered.forEach(f => {
      const qty = parseInt(f.quantity || 0);
      const minAlert = parseInt(f.minAlertQty || 3);
      
      let stockBadge = `<span class="badge badge-success">${qty} in stock</span>`;
      if (qty <= 0) stockBadge = `<span class="badge badge-danger">Out of stock</span>`;
      else if (qty <= minAlert) stockBadge = `<span class="badge badge-warning">Low (${qty})</span>`;

      html += `
        <tr>
          <td><strong>${f.id}</strong></td>
          <td>
            <div class="frame-name-cell">
              <strong>${f.brand} ${f.model}</strong>
              <div class="text-muted text-xs">${f.type} | ${f.size || 'Standard'}</div>
            </div>
          </td>
          <td>${f.color}</td>
          <td>${Utils.formatCurrency(f.purchasePrice)}</td>
          <td><strong class="text-primary">${Utils.formatCurrency(f.sellingPrice)}</strong></td>
          <td>${stockBadge}</td>
          <td><code>${f.barcode || 'N/A'}</code></td>
          <td>
            <div class="btn-group">
              <button class="btn btn-sm btn-secondary" title="Edit Frame" onclick="window.Frames.openEditFrameModal('${f.id}')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="btn btn-sm btn-danger" title="Delete" onclick="window.Frames.deleteFrame('${f.id}')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  },

  async openAddFrameModal() {
    const form = document.getElementById('frameModalForm');
    if (form) form.reset();
    const title = document.getElementById('frameModalTitle');
    const id = document.getElementById('frameModalId');
    if (title) title.textContent = 'Add New Frame';
    if (id) id.value = '';
    Utils.openModal('frameModal');
  },
  async openEditFrameModal(id) {
    const frame = window.db ? await window.db.getFrameById(id) : null;
    if (!frame) return;

    const title = document.getElementById('frameModalTitle');
    if (title) title.textContent = 'Edit Frame Details';
    document.getElementById('frameModalId').value = frame.id;
    document.getElementById('frameBrand').value = frame.brand;
    document.getElementById('frameModel').value = frame.model;
    document.getElementById('frameType').value = frame.type || 'Full Rim';
    document.getElementById('frameColor').value = frame.color || '';
    document.getElementById('frameSize').value = frame.size || '';
    document.getElementById('framePurchasePrice').value = frame.purchasePrice || 0;
    document.getElementById('frameSellingPrice').value = frame.sellingPrice || 0;
    document.getElementById('frameQuantity').value = frame.quantity || 1;
    document.getElementById('frameMinAlert').value = frame.minAlertQty || 3;
    document.getElementById('frameBarcode').value = frame.barcode || '';

    Utils.openModal('frameModal');
  },
  async saveFrameFromForm() {
    const brand = document.getElementById('frameBrand').value.trim();
    const model = document.getElementById('frameModel').value.trim();
    const sellingPrice = parseFloat(document.getElementById('frameSellingPrice').value) || 0;

    if (!brand || !model || sellingPrice <= 0) {
      Utils.showToast('Please specify Brand, Model and Selling Price', 'warning');
      return;
    }

    const frameData = {
      id: document.getElementById('frameModalId').value || undefined,
      brand,
      model,
      type: document.getElementById('frameType').value,
      color: document.getElementById('frameColor').value.trim(),
      size: document.getElementById('frameSize').value.trim(),
      purchasePrice: parseFloat(document.getElementById('framePurchasePrice').value) || 0,
      sellingPrice,
      quantity: parseInt(document.getElementById('frameQuantity').value) || 0,
      minAlertQty: parseInt(document.getElementById('frameMinAlert').value) || 3,
      barcode: document.getElementById('frameBarcode').value.trim()
    };

    if (window.db) window.db.saveFrame(frameData);
    Utils.closeModal('frameModal');
    Utils.showToast(`Frame ${brand} ${model} saved!`, 'success');
    this.renderFrameTable();
  },
  async deleteFrame(id) {
    const role = sessionStorage.getItem('khushi_user_role') || (window.db?.getAdmin()?.role) || 'Admin';
    if (role === 'Staff') {
      Utils.showToast('Access Denied: Staff accounts cannot delete inventory items.', 'error');
      return;
    }
    if (confirm('Delete this frame from stock?')) {
      if (window.db) window.db.deleteFrame(id);
      Utils.showToast('Frame removed from inventory', 'info');
      this.renderFrameTable();
    }
  },
  async exportFramesExcel() {
    const frames = window.db ? await window.db.getFrames() : [];
    if (!frames.length) return Utils.showToast('No frames in inventory to export', 'warning');
    const rows = frames.map(f => ({
      'Item ID': f.id, 'Brand': f.brand, 'Model': f.model, 'Type': f.type || '', 'Color': f.color || '', 'Size': f.size || '', 'Selling Price (₹)': f.sellingPrice || 0, 'Stock Qty': f.quantity || 0, 'Min Alert Qty': f.minAlertQty || 0, 'Barcode': f.barcode || ''
    }));
    Utils.exportToExcel(`KHUSHI_OPTICS_Frames_Inventory_${new Date().toISOString().slice(0, 10)}.xlsx`, rows, 'Frames Inventory');
  },
  async exportFramesCSV() {
    const frames = window.db ? await window.db.getFrames() : [];
    if (!frames.length) return Utils.showToast('No frames to export', 'warning');
    const rows = frames.map(f => ({ ID: f.id, Brand: f.brand, Model: f.model, Price: f.sellingPrice, Qty: f.quantity, Barcode: f.barcode || '' }));
    Utils.exportToCSV(`KHUSHI_OPTICS_Frames_Inventory_${new Date().toISOString().slice(0, 10)}.csv`, rows);
  }
};

window.Frames = Frames;
