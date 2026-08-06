const fs = require('fs');
const path = require('path');
const seedData = require('./seed');
const logger = require('../utils/logger');

const dataFilePath = path.join(__dirname, 'data.json');

class Database {
  constructor() {
    this.data = seedData;
    this.loadData();
  }

  loadData() {
    try {
      if (fs.existsSync(dataFilePath)) {
        const fileContent = fs.readFileSync(dataFilePath, 'utf8');
        if (fileContent) {
          this.data = JSON.parse(fileContent);
          logger.info('Backend database loaded successfully from data.json');
          return;
        }
      }
      this.saveData();
    } catch (err) {
      logger.error('Error loading backend database file, using seed data:', err);
      this.data = seedData;
    }
  }

  saveData() {
    try {
      fs.writeFileSync(dataFilePath, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      logger.error('Error saving backend database to file:', err);
    }
  }

  // Settings
  getSettings() { return this.data.settings; }
  updateSettings(newSettings) {
    this.data.settings = { ...this.data.settings, ...newSettings };
    this.saveData();
    return this.data.settings;
  }

  // Admin / Auth
  getAdmin() { return this.data.admin; }
  updateAdmin(newAdmin) {
    this.data.admin = { ...this.data.admin, ...newAdmin };
    this.saveData();
    return this.data.admin;
  }

  // Customers
  getCustomers() { return this.data.customers; }
  getCustomerById(id) { return this.data.customers.find(c => c.id === id); }
  addCustomer(customer) {
    const newCust = {
      ...customer,
      id: customer.id || `CUST-${Date.now().toString().slice(-4)}`,
      createdAt: customer.createdAt || new Date().toISOString()
    };
    this.data.customers.unshift(newCust);
    this.saveData();
    return newCust;
  }
  updateCustomer(id, updatedFields) {
    const idx = this.data.customers.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.data.customers[idx] = { ...this.data.customers[idx], ...updatedFields };
      this.saveData();
      return this.data.customers[idx];
    }
    return null;
  }
  deleteCustomer(id) {
    const initialLen = this.data.customers.length;
    this.data.customers = this.data.customers.filter(c => c.id !== id);
    this.saveData();
    return this.data.customers.length < initialLen;
  }

  // Frames
  getFrames() { return this.data.frames; }
  getFrameById(id) { return this.data.frames.find(f => f.id === id); }
  addFrame(frame) {
    const newFrame = {
      ...frame,
      id: frame.id || `FRM-${Date.now().toString().slice(-3)}`,
      updatedAt: new Date().toISOString().slice(0, 10)
    };
    this.data.frames.unshift(newFrame);
    this.saveData();
    return newFrame;
  }
  updateFrame(id, updatedFields) {
    const idx = this.data.frames.findIndex(f => f.id === id);
    if (idx !== -1) {
      this.data.frames[idx] = { ...this.data.frames[idx], ...updatedFields, updatedAt: new Date().toISOString().slice(0, 10) };
      this.saveData();
      return this.data.frames[idx];
    }
    return null;
  }
  deleteFrame(id) {
    const initialLen = this.data.frames.length;
    this.data.frames = this.data.frames.filter(f => f.id !== id);
    this.saveData();
    return this.data.frames.length < initialLen;
  }

  // Lenses
  getLenses() { return this.data.lenses; }
  getLensById(id) { return this.data.lenses.find(l => l.id === id); }
  addLens(lens) {
    const newLens = {
      ...lens,
      id: lens.id || `LNS-${Date.now().toString().slice(-3)}`,
      updatedAt: new Date().toISOString().slice(0, 10)
    };
    this.data.lenses.unshift(newLens);
    this.saveData();
    return newLens;
  }
  updateLens(id, updatedFields) {
    const idx = this.data.lenses.findIndex(l => l.id === id);
    if (idx !== -1) {
      this.data.lenses[idx] = { ...this.data.lenses[idx], ...updatedFields, updatedAt: new Date().toISOString().slice(0, 10) };
      this.saveData();
      return this.data.lenses[idx];
    }
    return null;
  }
  deleteLens(id) {
    const initialLen = this.data.lenses.length;
    this.data.lenses = this.data.lenses.filter(l => l.id !== id);
    this.saveData();
    return this.data.lenses.length < initialLen;
  }

  // Invoices
  getInvoices() { return this.data.invoices; }
  getInvoiceByNumber(invNum) { return this.data.invoices.find(i => i.invoiceNumber === invNum); }
  addInvoice(invoice) {
    const newInvoice = {
      ...invoice,
      createdAt: invoice.createdAt || new Date().toISOString()
    };
    this.data.invoices.unshift(newInvoice);
    
    // Auto increment next invoice number in settings
    this.data.settings.nextInvoiceNum = (parseInt(this.data.settings.nextInvoiceNum) || 108) + 1;
    this.saveData();
    return newInvoice;
  }
  updateInvoice(invNum, updatedFields) {
    const idx = this.data.invoices.findIndex(i => i.invoiceNumber === invNum);
    if (idx !== -1) {
      this.data.invoices[idx] = { ...this.data.invoices[idx], ...updatedFields };
      this.saveData();
      return this.data.invoices[idx];
    }
    return null;
  }
}

module.exports = new Database();
