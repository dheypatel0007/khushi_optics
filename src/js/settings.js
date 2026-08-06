/**
 * KHUSHI OPTICS - Settings & Backup Controller
 * Includes UPI ID settings, shop metadata, logo URL, manual/auto backup,
 * and Clear All Data with Mandatory PC Backup.
 */

const Settings = {
  render() {
    this.loadSettingsToForm();
  },

  loadSettingsToForm() {
    const s = window.db.getSettings();
    document.getElementById('setShopName').value = s.shopName || 'KHUSHI OPTICS';
    document.getElementById('setPhone1').value = s.phone1 || '9824735065';
    document.getElementById('setPhone2').value = s.phone2 || '9265778527';
    document.getElementById('setUpiId').value = s.upiId || '9824735065@upi';
    document.getElementById('setAddress').value = s.address || '';
    document.getElementById('setInvoiceFooter').value = s.invoiceFooter || '';
    document.getElementById('setInvoiceTerms').value = s.terms || '';
    document.getElementById('setThemeSelect').value = s.theme || 'dark';
    document.getElementById('setGstDefaultToggle').checked = s.gstEnabledDefault !== false;
    document.getElementById('setGstDefaultPercent').value = s.defaultGstPercent || 12;
  },

  saveSettingsFromForm() {
    const s = window.db.getSettings();
    s.shopName = document.getElementById('setShopName').value.trim();
    s.phone1 = document.getElementById('setPhone1').value.trim();
    s.phone2 = document.getElementById('setPhone2').value.trim();
    s.upiId = document.getElementById('setUpiId').value.trim() || '9824735065@upi';
    s.address = document.getElementById('setAddress').value.trim();
    s.invoiceFooter = document.getElementById('setInvoiceFooter').value.trim();
    s.terms = document.getElementById('setInvoiceTerms').value.trim();
    s.theme = document.getElementById('setThemeSelect').value;
    s.gstEnabledDefault = document.getElementById('setGstDefaultToggle').checked;
    s.defaultGstPercent = parseFloat(document.getElementById('setGstDefaultPercent').value) || 12;

    window.db.saveSettings(s);
    App.applySavedTheme();
    App.updateShopBranding();

    Utils.showToast('Shop Profile & UPI Details updated!', 'success');
  },

  async triggerQuickBackup() {
    const jsonData = window.db.exportFullData();
    if (window.electronAPI && window.electronAPI.exportBackup) {
      const res = await window.electronAPI.exportBackup(jsonData);
      if (res.success) {
        Utils.showToast(`Backup saved to: ${res.path}`, 'success');
        return true;
      }
    }
    
    // Browser fallback download
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KHUSHI_OPTICS_AutoBackup_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    Utils.showToast('Backup JSON downloaded to PC!', 'success');
    return true;
  },

  async triggerClearDataWithAutoBackup() {
    const pass = prompt('WARNING: Clear All Data will reset your Customers, Stock & Billing records.\nEnter your admin password (dheypatel0007) to proceed:');
    const admin = window.db.getAdmin();

    if (pass !== admin.passwordHash) {
      Utils.showToast('Incorrect Admin Password! Data reset cancelled.', 'error');
      return;
    }

    Utils.showToast('Step 1: Exporting full backup to PC...', 'info');
    await this.triggerQuickBackup();

    setTimeout(() => {
      window.db.clearAllDataWithBackup();
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
