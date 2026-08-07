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

export class Database {
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

export const db = new Database();
window.db = db;
