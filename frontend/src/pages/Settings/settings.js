/**
 * KHUSHI OPTICS - Settings & Backup Controller
 */

import { Utils } from '../../utils/utils.js';

export const Settings = {
  render() {
    this.loadSettingsToForm();
    this.renderBranchesTable();
  },

  loadSettingsToForm() {
    const s = window.db ? window.db.getSettings() : { shopName: 'KHUSHI OPTICS' };
    const elName = document.getElementById('setShopName');
    const elP1 = document.getElementById('setPhone1');
    const elP2 = document.getElementById('setPhone2');
    const elUpi = document.getElementById('setUpiId');
    const elAddr = document.getElementById('setAddress');
    const elFooter = document.getElementById('setInvoiceFooter');
    const elTerms = document.getElementById('setInvoiceTerms');
    const elTheme = document.getElementById('setThemeSelect');
    const elGstTog = document.getElementById('setGstDefaultToggle');
    const elGstPct = document.getElementById('setGstDefaultPercent');

    if (elName) elName.value = s.shopName || 'KHUSHI OPTICS';
    if (elP1) elP1.value = s.phone1 || '9824735065';
    if (elP2) elP2.value = s.phone2 || '9265778527';
    if (elUpi) elUpi.value = s.upiId || 'dheypatel2690-1@okicici';
    if (elAddr) elAddr.value = s.address || '';
    if (elFooter) elFooter.value = s.invoiceFooter || '';
    if (elTerms) elTerms.value = s.terms || '';
    if (elTheme) elTheme.value = s.theme || 'dark';
    if (elGstTog) elGstTog.checked = s.gstEnabledDefault !== false;
    if (elGstPct) elGstPct.value = s.defaultGstPercent || 12;
  },

  saveSettingsFromForm() {
    const s = window.db ? window.db.getSettings() : {};
    s.shopName = document.getElementById('setShopName').value.trim();
    s.phone1 = document.getElementById('setPhone1').value.trim();
    s.phone2 = document.getElementById('setPhone2').value.trim();
    s.upiId = document.getElementById('setUpiId').value.trim() || 'dheypatel2690-1@okicici';
    s.address = document.getElementById('setAddress').value.trim();
    s.invoiceFooter = document.getElementById('setInvoiceFooter').value.trim();
    s.terms = document.getElementById('setInvoiceTerms').value.trim();
    s.theme = document.getElementById('setThemeSelect').value;
    s.gstEnabledDefault = document.getElementById('setGstDefaultToggle').checked;
    s.defaultGstPercent = parseFloat(document.getElementById('setGstDefaultPercent').value) || 12;

    if (window.db) window.db.saveSettings(s);
    if (window.App) {
      window.App.applySavedTheme();
      window.App.updateShopBranding();
    }

    Utils.showToast('Shop Profile & UPI Details updated!', 'success');
  },

  renderBranchesTable() {
    const branches = window.db ? window.db.getBranches() : [];
    const container = document.getElementById('setBranchesList');
    if (!container) return;

    if (branches.length === 0) {
      container.innerHTML = `<div class="text-muted text-xs p-2">No secondary branches registered.</div>`;
      return;
    }

    container.innerHTML = branches.map(b => `
      <div class="flex items-center justify-between p-2 rounded mb-2" style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);">
        <div>
          <div class="font-bold text-sm text-primary">${b.name} ${b.isMain ? '<span class="badge badge-info text-xs ml-2">Main Branch</span>' : ''}</div>
          <div class="text-xs text-muted">${b.location || 'Branch Store'}</div>
        </div>
        ${!b.isMain ? `<button class="btn btn-sm btn-danger p-1" onclick="Settings.deleteBranch('${b.id}');">Delete</button>` : ''}
      </div>
    `).join('');
  },

  openAddBranchModal() {
    const name = prompt('Enter new Shop Branch Name (e.g. Sanand Branch, Satellite Branch):');
    if (!name || !name.trim()) return;

    const location = prompt('Enter Branch Location Address:') || '';
    if (window.db) {
      window.db.addBranch(name, location);
      Utils.showToast(`Branch "${name}" added successfully!`, 'success');
      this.renderBranchesTable();
      if (window.Billing) window.Billing.populateBranchDropdown();
      if (window.Dashboard) window.Dashboard.populateBranchFilter();
    }
  },

  deleteBranch(id) {
    if (confirm('Are you sure you want to delete this shop branch?')) {
      if (window.db) window.db.deleteBranch(id);
      Utils.showToast('Branch removed.', 'info');
      this.renderBranchesTable();
      if (window.Billing) window.Billing.populateBranchDropdown();
      if (window.Dashboard) window.Dashboard.populateBranchFilter();
    }
  },

  async triggerQuickBackup() {
    const jsonData = window.db ? window.db.exportFullData() : '{}';
    if (window.electronAPI && window.electronAPI.exportBackup) {
      const res = await window.electronAPI.exportBackup(jsonData);
      if (res.success) {
        Utils.showToast(`Backup saved to: ${res.path}`, 'success');
        return true;
      }
    }
    
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KHUSHI_OPTICS_AutoBackup_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    Utils.showToast('Backup JSON file downloaded to PC!', 'success');
    return true;
  },

  async triggerClearDataWithAutoBackup() {
    const pass = prompt('WARNING: Clear All Data will reset your Customers, Stock & Billing records.\nEnter your admin password (dheypatel0007) to proceed:');
    const admin = window.db ? window.db.getAdmin() : { passwordHash: 'dheypatel0007' };

    if (pass !== admin.passwordHash) {
      Utils.showToast('Incorrect Admin Password! Data reset cancelled.', 'error');
      return;
    }

    Utils.showToast('Step 1: Exporting full backup file to PC...', 'info');
    await this.triggerQuickBackup();

    setTimeout(() => {
      if (window.db) window.db.clearAllDataWithBackup();
      Utils.showToast('Step 2: Database cleared & backed up! Reloading...', 'success');
      setTimeout(() => window.location.reload(), 1500);
    }, 1000);
  },

  async triggerRestoreBackup() {
    if (confirm('WARNING: Restoring data will overwrite current records. Continue?')) {
      if (window.electronAPI && window.electronAPI.importBackup) {
        const res = await window.electronAPI.importBackup();
        if (res.success && res.data) {
          const importRes = window.db.importFullData(res.data);
          if (importRes.success) {
            Utils.showToast('Database restored successfully! Reloading...', 'success');
            setTimeout(() => window.location.reload(), 1500);
          } else {
            Utils.showToast(`Restore failed: ${importRes.error}`, 'error');
          }
        }
      } else {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = (e) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (evt) => {
              const importRes = window.db.importFullData(evt.target.result);
              if (importRes.success) {
                Utils.showToast('Database restored successfully! Reloading...', 'success');
                setTimeout(() => window.location.reload(), 1500);
              } else {
                Utils.showToast(`Restore failed: ${importRes.error}`, 'error');
              }
            };
            reader.readAsText(file);
          }
        };
        input.click();
      }
    }
  },

  openBillsFolder() {
    if (window.electronAPI && window.electronAPI.openBillsDirectory) {
      window.electronAPI.openBillsDirectory();
    } else {
      Utils.showToast('Bills folder: Documents/KHUSHI OPTICS/Bills/', 'info');
    }
  }
};

window.Settings = Settings;
