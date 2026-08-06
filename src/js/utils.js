/**
 * KHUSHI OPTICS - Advanced Utility Helper Functions
 * Features Official KHUSHI OPTICS Google Pay QR Code Integration
 */

const Utils = {
  // Format currency in INR (₹)
  formatCurrency(amount) {
    const num = parseFloat(amount) || 0;
    return '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  },

  // Format short currency without decimals
  formatCurrencyShort(amount) {
    const num = parseFloat(amount) || 0;
    return '₹' + Math.round(num).toLocaleString('en-IN');
  },

  // Format date string (e.g. 04 Aug 2026)
  formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  },

  // Format full date & time
  formatDateTime(dateStr) {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' +
           d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  },

  // Show Toast Notification
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

  // Modal open helper
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  },

  // Modal close helper
  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  },

  // Optical Smart Lens Recommender
  recommendLensType(reSphVal, leSphVal) {
    const maxPower = Math.max(Math.abs(parseFloat(reSphVal) || 0), Math.abs(parseFloat(leSphVal) || 0));
    if (maxPower >= 6.0) return { index: '1.67 / 1.74 Ultra High Index', recommendation: 'Ultra-thin lightweight lens required for high prescription' };
    if (maxPower >= 3.0) return { index: '1.61 High Index', recommendation: 'Slim high-index lens recommended to reduce edge thickness' };
    return { index: '1.56 Mid Index (Blue Cut / Anti Glare)', recommendation: 'Standard mid-index lens suitable for mild prescription' };
  },

  // Generate Code 128 / Vector Barcode SVG Representation
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

  // Generate Official Google Pay / Custom Payment QR Code Image
  generateUPIQRCode(upiId, payeeName, amount, invoiceNum) {
    const finalUpi = upiId || '9824735065@upi';
    const qrDataUri = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`upi://pay?pa=${finalUpi}&pn=${payeeName}`)}`;

    return `
      <div class="qr-code-placeholder" style="background:#ffffff; padding:10px; border-radius:10px; display:inline-block; border:2px solid #0284c7; text-align:center; box-shadow:0 4px 10px rgba(0,0,0,0.1);">
        <img src="${qrDataUri}" 
             alt="KHUSHI OPTICS Google Pay QR" 
             style="width:130px; height:130px; display:block; margin:0 auto; border-radius:6px; object-fit:contain;" 
             onerror="this.onerror=null; this.src='https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=9824735065@upi%26pn=KHUSHI%20OPTICS';"/>
        <div style="font-size:11px; color:#0f172a; margin-top:6px; font-weight:800; font-family:sans-serif;">
          Scan to Pay via GPay / PhonePe / Paytm
        </div>
        <div style="font-size:10px; color:#0284c7; font-weight:600; margin-top:2px;">
          UPI ID: ${finalUpi}
        </div>
      </div>
    `;
  },

  // Export array of objects to CSV
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
