
  const window = { html2pdf: () => ({ set: () => ({ from: () => ({ outputPdf: async () => 'pdfdata', save: async () => {} }) }) }) };
  const document = {
    getElementById: (id) => {
      if (id === 'posExtraChargesInput') return null;
      return { value: 'test', style: {}, dataset: {}, classList: {add: ()=>{}, remove: ()=>{}}, appendChild: ()=>{}, innerHTML: '' };
    },
    createElement: () => ({ classList: {add: ()=>{}, remove: ()=>{}}, appendChild: ()=>{}, style: {}, setAttribute: ()=>{}, parentNode: { insertBefore: ()=>{} } }),
    querySelector: () => ({ insertBefore: ()=>{} }),
    body: { appendChild: ()=>{}, removeChild: ()=>{} }
  };
  const localStorage = {
    getItem: () => null,
    setItem: () => {}
  };
  /**
 * KHUSHI OPTICS - Utility Helper Functions
 */

const Utils = {
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

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      Utils.showToast('CSV Exported Successfully!', 'success');
    } else {
      Utils.showToast('CSV Download not supported in this browser.', 'error');
    }
  }
};

window.Utils = Utils;

  window.Utils = Utils;
  Utils.openModal = () => console.log('MODAL OPENED');
  /**
 * KHUSHI OPTICS - Database Persistence & Data Service
 */

const DB_KEYS = {
  SETTINGS: 'khushi_settings',
  ADMIN: 'khushi_admin',
  CUSTOMERS: 'khushi_customers',
  FRAMES: 'khushi_frames',
  LENSES: 'khushi_lenses',
  INVOICES: 'khushi_invoices',
  REMINDERS: 'khushi_reminders',
  BACKUP_LOGS: 'khushi_backup_logs',
  BRANCHES: 'khushi_branches'
};

const DEFAULT_BRANCHES = [
  { id: 'BR-01', name: 'Bavla Branch (Main)', location: 'Bavla, Gujarat', isMain: true },
  { id: 'BR-02', name: 'Ahmedabad Branch', location: 'South Bopal, Ahmedabad', isMain: false },
  { id: 'BR-03', name: 'Sanand Branch', location: 'Station Road, Sanand', isMain: false }
];

const DEFAULT_SHOP_SETTINGS = {
  shopName: 'KHUSHI OPTICS',
  phone1: '9824735065',
  phone2: '9265778527',
  upiId: 'dheypatel2690-1@okicici',
  address: 'Krishna Complex, In Front of Yash Bhajipau, Bavla - 382220, Gujarat, India',
  invoiceFooter: 'Thank you for choosing KHUSHI OPTICS! Please test your eyes regularly.',
  terms: '1. Goods once sold will not be taken back.\n2. 6 Months warranty on frame manufacturing defects.\n3. Lens breakage is not covered under warranty.\n4. Please present this bill for any servicing or queries.',
  logoUrl: '',
  backupFolder: 'Documents/KHUSHI OPTICS/Backups',
  theme: 'dark',
  gstEnabledDefault: true,
  defaultGstPercent: 12,
  invoicePrefix: 'KO-2026-',
  nextInvoiceNum: 108
};

const DEFAULT_ADMIN = {
  username: 'dheypatel2690@gmail.com',
  passwordHash: 'dheypatel0007',
  remember: true
};

const SAMPLE_CUSTOMERS = [
  {
    id: 'CUST-1001',
    name: 'Rajeshbhai Patel',
    mobile: '9825012345',
    address: 'Station Road, Bavla',
    age: 45,
    gender: 'Male',
    doctorName: 'Dr. V. K. Shah',
    remarks: 'Prefers Blue Cut progressive lenses',
    createdAt: '2026-07-15T10:30:00.000Z',
    prescription: {
      rightEye: { sph: '-1.50', cyl: '-0.50', axis: '90', add: '+2.00', pd: '31.5' },
      leftEye: { sph: '-1.75', cyl: '-0.75', axis: '85', add: '+2.00', pd: '31.5' }
    }
  },
  {
    id: 'CUST-1002',
    name: 'Priyaben Sharma',
    mobile: '9724098765',
    address: 'Near Government High School, Bavla',
    age: 28,
    gender: 'Female',
    doctorName: 'Dr. N. M. Mehta',
    remarks: 'First time wearing anti-glare glasses',
    createdAt: '2026-07-20T14:15:00.000Z',
    prescription: {
      rightEye: { sph: '-0.75', cyl: '0.00', axis: '0', add: '0.00', pd: '30.0' },
      leftEye: { sph: '-1.00', cyl: '-0.25', axis: '180', add: '0.00', pd: '30.0' }
    }
  }
];

const SAMPLE_FRAMES = [
  {
    id: 'FRM-101',
    brand: 'Ray-Ban',
    model: 'RB3025 Aviator',
    type: 'Full Rim',
    color: 'Matte Gold / Green G-15',
    size: 'Medium (58mm)',
    purchasePrice: 2800,
    sellingPrice: 4200,
    quantity: 8,
    minAlertQty: 3,
    barcode: '805289602057',
    updatedAt: '2026-08-01'
  },
  {
    id: 'FRM-102',
    brand: 'Oakley',
    model: 'OX8156 Holbrook RX',
    type: 'Full Rim',
    color: 'Satin Black',
    size: 'Large (56mm)',
    purchasePrice: 2400,
    sellingPrice: 3800,
    quantity: 2,
    minAlertQty: 3,
    barcode: '888392451009',
    updatedAt: '2026-08-02'
  }
];

const SAMPLE_LENSES = [
  {
    id: 'LNS-201',
    company: 'Essilor',
    type: 'Single Vision',
    features: ['Blue Cut', 'Anti Glare', 'UV Protection'],
    index: '1.56 Mid Index',
    purchasePrice: 450,
    sellingPrice: 950,
    quantity: 25,
    minAlertQty: 5
  },
  {
    id: 'LNS-202',
    company: 'Crizal',
    type: 'Progressive',
    features: ['Blue Cut', 'Photochromic', 'Anti Glare', 'High Index'],
    index: '1.61 High Index',
    purchasePrice: 1800,
    sellingPrice: 3800,
    quantity: 12,
    minAlertQty: 3
  }
];

const SAMPLE_INVOICES = [
  {
    invoiceNumber: 'KO-2026-101',
    date: '2026-08-01T11:30:00.000Z',
    customerId: 'CUST-1001',
    customerName: 'Rajeshbhai Patel',
    customerPhone: '9825012345',
    customerAddress: 'Station Road, Bavla',
    prescription: {
      rightEye: { sph: '-1.50', cyl: '-0.50', axis: '90', add: '+2.00', pd: '31.5' },
      leftEye: { sph: '-1.75', cyl: '-0.75', axis: '85', add: '+2.00', pd: '31.5' }
    },
    items: [
      { type: 'Frame', id: 'FRM-101', title: 'Ray-Ban RB3025 Aviator', qty: 1, unitPrice: 4200, amount: 4200 },
      { type: 'Lens', id: 'LNS-202', title: 'Crizal Progressive (Blue Cut / Photochromic)', qty: 1, unitPrice: 3800, amount: 3800 }
    ],
    subtotal: 8000,
    discountPercent: 10,
    discountAmount: 800,
    gstEnabled: true,
    gstPercent: 12,
    cgstAmount: 432,
    sgstAmount: 432,
    totalGstAmount: 864,
    netTotal: 8064,
    paidAmount: 8064,
    balanceDue: 0,
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    doctorName: 'Dr. V. K. Shah',
    remarks: 'Full payment cleared via Google Pay'
  }
];

class Database {
  constructor() {
    this.initDatabase();
  }

  initDatabase() {
    if (!localStorage.getItem(DB_KEYS.SETTINGS)) {
      localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify(DEFAULT_SHOP_SETTINGS));
    } else {
      const currentSettings = JSON.parse(localStorage.getItem(DB_KEYS.SETTINGS));
      if (!currentSettings.upiId || currentSettings.upiId === '9824735065@upi') {
        currentSettings.upiId = 'dheypatel2690-1@okicici';
        localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify(currentSettings));
      }
    }

    // Only seed admin on first run — do NOT overwrite on every load
    if (!localStorage.getItem(DB_KEYS.ADMIN)) {
      localStorage.setItem(DB_KEYS.ADMIN, JSON.stringify(DEFAULT_ADMIN));
    } else {
      // Migrate old 'dhey' username to email if still present
      const existingAdmin = JSON.parse(localStorage.getItem(DB_KEYS.ADMIN));
      if (existingAdmin.username === 'dhey') {
        existingAdmin.username = 'dheypatel2690@gmail.com';
        localStorage.setItem(DB_KEYS.ADMIN, JSON.stringify(existingAdmin));
      }
    }

    if (!localStorage.getItem(DB_KEYS.CUSTOMERS)) {
      localStorage.setItem(DB_KEYS.CUSTOMERS, JSON.stringify(SAMPLE_CUSTOMERS));
    }
    if (!localStorage.getItem(DB_KEYS.FRAMES)) {
      localStorage.setItem(DB_KEYS.FRAMES, JSON.stringify(SAMPLE_FRAMES));
    }
    if (!localStorage.getItem(DB_KEYS.LENSES)) {
      localStorage.setItem(DB_KEYS.LENSES, JSON.stringify(SAMPLE_LENSES));
    }
    if (!localStorage.getItem(DB_KEYS.INVOICES)) {
      localStorage.setItem(DB_KEYS.INVOICES, JSON.stringify(SAMPLE_INVOICES));
    }
    if (!localStorage.getItem(DB_KEYS.BRANCHES)) {
      localStorage.setItem(DB_KEYS.BRANCHES, JSON.stringify(DEFAULT_BRANCHES));
    }
  }

  getBranches() {
    return JSON.parse(localStorage.getItem(DB_KEYS.BRANCHES)) || DEFAULT_BRANCHES;
  }

  saveBranches(branches) {
    localStorage.setItem(DB_KEYS.BRANCHES, JSON.stringify(branches));
  }

  addBranch(name, location = '') {
    const branches = this.getBranches();
    const newBranch = {
      id: `BR-0${branches.length + 1}`,
      name: name.trim(),
      location: location.trim(),
      isMain: branches.length === 0
    };
    branches.push(newBranch);
    this.saveBranches(branches);
    return newBranch;
  }

  deleteBranch(id) {
    let branches = this.getBranches().filter(b => b.id !== id);
    if (!branches.some(b => b.isMain) && branches.length > 0) {
      branches[0].isMain = true;
    }
    this.saveBranches(branches);
  }

  getSettings() { return JSON.parse(localStorage.getItem(DB_KEYS.SETTINGS)) || DEFAULT_SHOP_SETTINGS; }
  saveSettings(settings) {
    localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify(settings));
    return settings;
  }

  getAdmin() { return JSON.parse(localStorage.getItem(DB_KEYS.ADMIN)) || DEFAULT_ADMIN; }
  saveAdmin(adminData) {
    localStorage.setItem(DB_KEYS.ADMIN, JSON.stringify(adminData));
    return adminData;
  }

  getCustomers() { return JSON.parse(localStorage.getItem(DB_KEYS.CUSTOMERS)) || []; }
  getCustomerById(id) { return this.getCustomers().find(c => c.id === id); }
  saveCustomer(customer) {
    const customers = this.getCustomers();
    if (!customer.id) {
      customer.id = 'CUST-' + Math.floor(1000 + Math.random() * 9000);
      customer.createdAt = new Date().toISOString();
      customers.unshift(customer);
    } else {
      const idx = customers.findIndex(c => c.id === customer.id);
      if (idx !== -1) customers[idx] = { ...customers[idx], ...customer };
      else customers.unshift(customer);
    }
    localStorage.setItem(DB_KEYS.CUSTOMERS, JSON.stringify(customers));
    return customer;
  }
  deleteCustomer(id) {
    let customers = this.getCustomers().filter(c => c.id !== id);
    localStorage.setItem(DB_KEYS.CUSTOMERS, JSON.stringify(customers));
  }
  deleteAllCustomers() {
    localStorage.setItem(DB_KEYS.CUSTOMERS, JSON.stringify([]));
  }

  getFrames() { return JSON.parse(localStorage.getItem(DB_KEYS.FRAMES)) || []; }
  getFrameById(id) { return this.getFrames().find(f => f.id === id); }
  saveFrame(frame) {
    const frames = this.getFrames();
    frame.updatedAt = new Date().toISOString().slice(0, 10);
    if (!frame.id) {
      frame.id = 'FRM-' + Math.floor(100 + Math.random() * 900);
      frames.unshift(frame);
    } else {
      const idx = frames.findIndex(f => f.id === frame.id);
      if (idx !== -1) frames[idx] = { ...frames[idx], ...frame };
      else frames.unshift(frame);
    }
    localStorage.setItem(DB_KEYS.FRAMES, JSON.stringify(frames));
    return frame;
  }
  deleteFrame(id) {
    let frames = this.getFrames().filter(f => f.id !== id);
    localStorage.setItem(DB_KEYS.FRAMES, JSON.stringify(frames));
  }
  updateFrameStock(id, changeQty) {
    const frames = this.getFrames();
    const frame = frames.find(f => f.id === id);
    if (frame) {
      frame.quantity = Math.max(0, parseInt(frame.quantity || 0) + changeQty);
      localStorage.setItem(DB_KEYS.FRAMES, JSON.stringify(frames));
    }
  }

  getLenses() { return JSON.parse(localStorage.getItem(DB_KEYS.LENSES)) || []; }
  getLensById(id) { return this.getLenses().find(l => l.id === id); }
  saveLens(lens) {
    const lenses = this.getLenses();
    if (!lens.id) {
      lens.id = 'LNS-' + Math.floor(200 + Math.random() * 800);
      lenses.unshift(lens);
    } else {
      const idx = lenses.findIndex(l => l.id === lens.id);
      if (idx !== -1) lenses[idx] = { ...lenses[idx], ...lens };
      else lenses.unshift(lens);
    }
    localStorage.setItem(DB_KEYS.LENSES, JSON.stringify(lenses));
    return lens;
  }
  deleteLens(id) {
    let lenses = this.getLenses().filter(l => l.id !== id);
    localStorage.setItem(DB_KEYS.LENSES, JSON.stringify(lenses));
  }
  updateLensStock(id, changeQty) {
    const lenses = this.getLenses();
    const lens = lenses.find(l => l.id === id);
    if (lens) {
      lens.quantity = Math.max(0, parseInt(lens.quantity || 0) + changeQty);
      localStorage.setItem(DB_KEYS.LENSES, JSON.stringify(lenses));
    }
  }

  getInvoices() { return JSON.parse(localStorage.getItem(DB_KEYS.INVOICES)) || []; }
  getInvoiceByNumber(invNum) { return this.getInvoices().find(inv => inv.invoiceNumber === invNum); }
  saveInvoice(invoice) {
    const invoices = this.getInvoices();
    const settings = this.getSettings();

    if (!invoice.invoiceNumber) {
      const num = settings.nextInvoiceNum || 108;
      invoice.invoiceNumber = (settings.invoicePrefix || 'KO-2026-') + num;
      settings.nextInvoiceNum = num + 1;
      this.saveSettings(settings);
      invoices.unshift(invoice);
    } else {
      const idx = invoices.findIndex(i => i.invoiceNumber === invoice.invoiceNumber);
      if (idx !== -1) invoices[idx] = { ...invoices[idx], ...invoice };
      else invoices.unshift(invoice);
    }

    localStorage.setItem(DB_KEYS.INVOICES, JSON.stringify(invoices));
    return invoice;
  }
  updateInvoicePayment(invoiceNumber, additionalPayment, paymentMethod) {
    const invoices = this.getInvoices();
    const inv = invoices.find(i => i.invoiceNumber === invoiceNumber);
    if (inv) {
      inv.paidAmount = parseFloat(inv.paidAmount || 0) + parseFloat(additionalPayment);
      inv.balanceDue = Math.max(0, parseFloat(inv.netTotal) - inv.paidAmount);
      inv.paymentStatus = inv.balanceDue <= 0 ? 'Paid' : 'Pending';
      inv.lastPaymentDate = new Date().toISOString();
      if (paymentMethod) inv.paymentMethod = paymentMethod;
      localStorage.setItem(DB_KEYS.INVOICES, JSON.stringify(invoices));
    }
    return inv;
  }

  clearAllDataWithBackup() {
    const backupJson = this.exportFullData();
    localStorage.setItem(DB_KEYS.CUSTOMERS, JSON.stringify([]));
    localStorage.setItem(DB_KEYS.FRAMES, JSON.stringify([]));
    localStorage.setItem(DB_KEYS.LENSES, JSON.stringify([]));
    localStorage.setItem(DB_KEYS.INVOICES, JSON.stringify([]));
    return backupJson;
  }

  exportFullData() {
    return JSON.stringify({
      version: '1.0',
      timestamp: new Date().toISOString(),
      shopDetails: this.getSettings(),
      customers: this.getCustomers(),
      frames: this.getFrames(),
      lenses: this.getLenses(),
      invoices: this.getInvoices()
    }, null, 2);
  }

  importFullData(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.shopDetails) localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify(data.shopDetails));
      if (data.customers) localStorage.setItem(DB_KEYS.CUSTOMERS, JSON.stringify(data.customers));
      if (data.frames) localStorage.setItem(DB_KEYS.FRAMES, JSON.stringify(data.frames));
      if (data.lenses) localStorage.setItem(DB_KEYS.LENSES, JSON.stringify(data.lenses));
      if (data.invoices) localStorage.setItem(DB_KEYS.INVOICES, JSON.stringify(data.invoices));
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
}




  const db = new Database();
  window.db = db;
  /**
 * KHUSHI OPTICS - 8-Step POS Billing & Invoice Engine
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
    dueDate: '',
    roundOff: 0
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
  
  handleRoundOffToggle(checked) {
    this.activeInvoice.enableRoundOff = checked;
    this.recalculateTotals();
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

    const exactTotal = afterDiscount + totalGst;
    let netTotal = exactTotal;
    let roundOff = 0;
    
    if (this.activeInvoice.enableRoundOff !== false) {
      netTotal = Math.round(exactTotal);
      roundOff = netTotal - exactTotal;
    }
    
    const netEl = document.getElementById('posNetTotalDisplay');
    if (netEl) netEl.textContent = Utils.formatCurrency(netTotal);

    const paidInput = document.getElementById('posPaidAmountInput');
    let paidAmount = netTotal;
    if (paidInput) {
      if (paidInput.dataset.modified === 'true') {
        paidAmount = parseFloat(paidInput.value);
        if (isNaN(paidAmount)) paidAmount = 0;
      } else {
        paidInput.value = netTotal;
      }
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
    this.activeInvoice.roundOff = roundOff;
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
      roundOff: this.activeInvoice.roundOff || 0,
      paidAmount: this.activeInvoice.paidAmount,
      balanceDue: this.activeInvoice.balanceDue,
      paymentMethod,
      paymentStatus: this.activeInvoice.balanceDue <= 0 ? 'Paid' : 'Pending',
      dueDate: dueDate || undefined,
      remarks
    };

    const savedInvoice = window.db ? window.db.saveInvoice(invoiceRecord) : invoiceRecord;
    Utils.showToast(`Invoice ${savedInvoice.invoiceNumber} generated!`, 'success');

    this.viewInvoiceDetails(savedInvoice.invoiceNumber);
    this.autoSavePDFToFile(savedInvoice);
    this.resetBillingForm();
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
      dueDate: '',
      roundOff: 0
    };

    const custSel = document.getElementById('posCustomerSelect');
    const frmSel = document.getElementById('posFrameSelect');
    const lnsSel = document.getElementById('posLensSelect');
    const extIn = document.getElementById('posExtraChargesInput');
    const discSel = document.getElementById('posDiscountSelect');
    const custDisc = document.getElementById('posCustomDiscountInput');
    const remIn = document.getElementById('posRemarksInput');
    const custCard = document.getElementById('posCustomerDetailsCard');
    const roundOffToggle = document.getElementById('posRoundOffToggle');
    const qrCard = document.getElementById('posUpiQrPreviewCard');
    const paidInput = document.getElementById('posPaidAmountInput');

    if (custSel) custSel.value = '';
    if (frmSel) frmSel.value = '';
    if (lnsSel) lnsSel.value = '';
    if (extIn) extIn.value = '';
    if (discSel) discSel.value = '0';
    if (custDisc) custDisc.value = '';
    if (remIn) remIn.value = '';
    if (custCard) custCard.style.display = 'none';
    if (qrCard) qrCard.style.display = 'none';
    if (roundOffToggle) roundOffToggle.checked = true;
    if (paidInput) {
      paidInput.value = '';
      paidInput.dataset.modified = 'false';
    }

    this.recalculateTotals();
  },

  async viewInvoiceDetails(invoiceNumber) {
    const invoice = window.db ? await window.db.getInvoiceByNumber(invoiceNumber) : null;
    if (!invoice) return;

    const shop = window.db ? await window.db.getSettings() : { shopName: 'KHUSHI OPTICS' };
    const container = document.getElementById('printableInvoiceContainer');
    if (!container) return;
    
    container.innerHTML = await this.generateInvoiceHtml(invoice, shop, true, 'TAX INVOICE');

    const printBtn = document.getElementById('invoiceModalPrintBtn');
    const pdfBtn = document.getElementById('invoiceModalPdfBtn');
    const waBtn = document.getElementById('invoiceModalWhatsappBtn');
    let customerBillBtn = document.getElementById('invoiceModalCustomerBillBtn');

    if (printBtn) printBtn.onclick = () => this.printInvoiceAction();
    if (pdfBtn) pdfBtn.onclick = () => this.downloadInvoicePDF(invoice);
    if (waBtn) waBtn.onclick = () => this.shareWhatsAppInvoice(invoice);
    if (customerBillBtn) {
      customerBillBtn.onclick = async () => {
        container.innerHTML = await this.generateInvoiceHtml(invoice, shop, true, 'CUSTOMER BILL');
        this.printInvoiceAction();
      };
    }

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

  async generateInvoiceHtml(invoice, shop, isPrint = false, billType = 'TAX INVOICE') {
    const shopData = shop || (window.db ? await window.db.getSettings() : { shopName: 'KHUSHI OPTICS' });
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

    const qrCodeHtml = Utils.generateUPIQRCode(shopData.upiId || 'dheypatel2690-1@okicici', shopData.shopName, invoice.netTotal, invoice.invoiceNumber);

    return `
      <div class="invoice-paper" id="invoicePaper">
        <div class="inv-header">
          <div class="inv-brand">
            <h2>${shopData.shopName}</h2>
            <div class="inv-sub font-mono">${shopData.address}</div>
            <div class="inv-sub">Phone: <strong>${shopData.phone1}</strong> / <strong>${shopData.phone2}</strong></div>
          </div>
          <div class="inv-meta">
            <div class="inv-title">${billType}</div>
            <div class="inv-num">Inv #: <strong>${invoice.invoiceNumber}</strong></div>
            <div class="inv-date">Date: ${dateFormatted}</div>
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
            ${invoice.gstEnabled && billType !== 'CUSTOMER BILL' ? `
              <div class="inv-total-line">
                <span>CGST (${(invoice.gstPercent/2)}%):</span>
                <span>+ ${Utils.formatCurrency(invoice.cgstAmount)}</span>
              </div>
              <div class="inv-total-line">
                <span>SGST (${(invoice.gstPercent/2)}%):</span>
                <span>+ ${Utils.formatCurrency(invoice.sgstAmount)}</span>
              </div>
            ` : ''}
            ${invoice.roundOff ? `
              <div class="inv-total-line">
                <span>Round Off:</span>
                <span>${invoice.roundOff > 0 ? '+' : ''}${Utils.formatCurrency(invoice.roundOff)}</span>
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

    const container = document.getElementById('printableInvoiceContainer');
    if (!container) return;
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

  printInvoiceAction() {
    if (window.electronAPI && window.electronAPI.printInvoice) {
      window.electronAPI.printInvoice();
    } else {
      window.print();
    }
  },

  async downloadInvoicePDF(invoice) {
    Utils.showToast('Generating high-quality A4 PDF...', 'info');
    const sourceEl = document.getElementById('invoicePaper') || document.getElementById('printableInvoiceContainer');
    
    if (window.html2pdf && sourceEl) {
      const cleanInvNumber = (invoice && invoice.invoiceNumber) ? invoice.invoiceNumber.replace(/[^a-zA-Z0-9]/g, '-') : 'Bill';
      const opt = {
        margin:       10,
        filename:     `Invoice-KO-${cleanInvNumber}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, allowTaint: true, logging: false },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      setTimeout(() => {
        window.html2pdf().set(opt).from(sourceEl).save().then(() => {
          Utils.showToast(`Invoice-KO-${cleanInvNumber}.pdf downloaded successfully!`, 'success');
        }).catch(err => {
          console.error('PDF generation error:', err);
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
          const opt = {
            margin:       10,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true, allowTaint: true, logging: false },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
          };
          const pdfDataUri = await window.html2pdf().set(opt).from(sourceEl).outputPdf('datauristring');
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


  (async () => {
    try {
      Billing.activeInvoice.customer = { id: 'test', name: 'Test' };
      Billing.activeInvoice.selectedFrame = { id: 'f1', sellingPrice: 100 };
      await Billing.generateAndSaveInvoice();
      console.log('SUCCESS');
    } catch(e) {
      console.log('ERROR:', e.message, e.stack);
    }
  })();
