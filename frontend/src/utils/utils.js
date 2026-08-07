/**
 * KHUSHI OPTICS - Utility Helper Functions
 */

export const Utils = {
  formatCurrency(amount) {
    const num = parseFloat(amount) || 0;
    return '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  },

  formatCurrencyShort(amount) {
    const num = parseFloat(amount) || 0;
    return '₹' + Math.round(num).toLocaleString('en-IN');
  },

  formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  },

  formatDateTime(dateStr) {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' +
           d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  },

  showToast(message, type = 'info') {
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toastContainer';
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type} animate-slide-in`;
    
    let iconSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
    if (type === 'success') iconSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
    if (type === 'error') iconSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
    if (type === 'warning') iconSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>';

    toast.innerHTML = `
      <div class="toast-icon">${iconSvg}</div>
      <div class="toast-message">${message}</div>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-fade-out');
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  },

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  },

  showLoading(isVisible) {
    let loader = document.getElementById('globalLoadingSpinner');
    if (!loader) {
      loader = document.createElement('div');
      loader.id = 'globalLoadingSpinner';
      loader.innerHTML = `
        <div style="position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(15, 23, 42, 0.7); z-index:9999; display:flex; justify-content:center; align-items:center; backdrop-filter:blur(4px);">
          <div style="width:40px; height:40px; border:4px solid #cbd5e1; border-top-color:#38bdf8; border-radius:50%; animation:spin 1s linear infinite;"></div>
          <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
        </div>
      `;
      document.body.appendChild(loader);
    }
    loader.style.display = isVisible ? 'flex' : 'none';
  },

  recommendLensType(reSphVal, leSphVal) {
    const maxPower = Math.max(Math.abs(parseFloat(reSphVal) || 0), Math.abs(parseFloat(leSphVal) || 0));
    if (maxPower >= 6.0) return { index: '1.67 / 1.74 Ultra High Index', recommendation: 'Ultra-thin lightweight lens required for high prescription' };
    if (maxPower >= 3.0) return { index: '1.61 High Index', recommendation: 'Slim high-index lens recommended to reduce edge thickness' };
    return { index: '1.56 Mid Index (Blue Cut / Anti Glare)', recommendation: 'Standard mid-index lens suitable for mild prescription' };
  },

  generateBarcodeSVG(codeStr) {
    const text = codeStr || 'KO-FRM-101';
    return `
      <div style="text-align:center; padding:10px; background:#ffffff; border-radius:6px; border:1px solid #cbd5e1; display:inline-block;">
        <div style="font-size:10px; font-weight:bold; color:#0f172a; margin-bottom:4px;">KHUSHI OPTICS BARCODE</div>
        <div style="letter-spacing:4px; font-family:monospace; font-size:22px; font-weight:900; color:#000000; background:#f8fafc; padding:6px 12px; border:2px dashed #0f172a; border-radius:4px;">
          ||| | |||| | || ||| || ||
        </div>
        <div style="font-size:11px; font-family:monospace; font-weight:bold; color:#334155; margin-top:4px;">*${text}*</div>
      </div>
    `;
  },

  generateUPIQRCode(upiId, payeeName, amount, invoiceNum) {
    const finalUpi = upiId || 'dheypatel2690-1@okicici';
    return `
      <div class="qr-code-placeholder" style="background:#ffffff; padding:10px; border-radius:10px; display:inline-block; border:2px solid #0284c7; text-align:center; box-shadow:0 4px 10px rgba(0,0,0,0.1);">
        <img src="/images/upi-qr-code.png" 
             alt="KHUSHI OPTICS Official Google Pay QR" 
             style="width:130px; height:130px; display:block; margin:0 auto; border-radius:6px; object-fit:contain;"
             onerror="this.onerror=null; this.src='https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=upi://pay?pa=dheypatel2690-1@okicici%26pn=KHUSHI%20OPTICS';"/>
        <div style="font-size:11px; color:#0f172a; margin-top:6px; font-weight:800; font-family:sans-serif;">
          Scan to pay with any UPI app
        </div>
        <div style="font-size:10px; color:#0284c7; font-weight:700; margin-top:2px;">
          UPI ID: ${finalUpi}
        </div>
      </div>
    `;
  },

  exportToExcel(filename, rows, sheetName = 'Report Data') {
    if (!rows || !rows.length) {
      Utils.showToast('No data to export to Excel', 'warning');
      return;
    }
    try {
      if (window.XLSX && window.XLSX.utils) {
        const worksheet = window.XLSX.utils.json_to_sheet(rows);
        const workbook = window.XLSX.utils.book_new();
        window.XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        const fileOut = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
        window.XLSX.writeFile(workbook, fileOut);
        Utils.showToast('Excel (.xlsx) file downloaded successfully!', 'success');
      } else {
        Utils.exportToCSV(filename.replace('.xlsx', '.csv'), rows);
      }
    } catch (e) {
      console.error('Excel Export Error:', e);
      Utils.showToast('Generating standard CSV format...', 'info');
      Utils.exportToCSV(filename.replace('.xlsx', '.csv'), rows);
    }
  },

  exportToCSV(filename, rows) {
    if (!rows || !rows.length) {
      Utils.showToast('No data to export', 'warning');
      return;
    }

    const separator = ',';
    const keys = Object.keys(rows[0]);
    const csvContent =
      keys.join(separator) +
      '\n' +
      rows
        .map(row => {
          return keys
            .map(k => {
              let cell = row[k] === null || row[k] === undefined ? '' : row[k].toString();
              cell = cell.replace(/"/g, '""');
              if (cell.search(/("|,|\n)/g) >= 0) {
                cell = `"${cell}"`;
              }
              return cell;
            })
            .join(separator);
        })
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
};

window.Utils = Utils;
