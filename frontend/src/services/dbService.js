/**
 * KHUSHI OPTICS - Enterprise Reactive Cloud Database & Real-Time Sync Service
 * Interacts directly with MongoDB Atlas backend without any local persistence (localStorage).
 * Real-time WebSocket sync pushes UI updates to active clients.
 */

import { apiClient } from '../api/apiClient.js';

export class Database {
  constructor() {
    this.apiBase = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? (window.location.port === '5000' ? '' : 'http://localhost:5000')
      : '';
      
    this.socket = null;
    this.initCloudSync();
  }

  async initCloudSync() {
    // Connect Socket.IO Real-Time WebSockets
    if (window.io) {
      try {
        const socketUrl = this.apiBase || window.location.origin;
        this.socket = window.io(socketUrl, { withCredentials: true });
        
        this.socket.on('connect', () => {
          console.log('🔗 Real-time WebSocket sync active:', this.socket.id);
        });

        this.socket.on('sync_delta', (delta) => {
          console.log('📡 Real-time remote update received:', delta);
          // Broadcast to UI components to trigger re-renders
          window.dispatchEvent(new CustomEvent('cloud_sync', { detail: delta }));
        });
      } catch (wsErr) {
        console.warn('Socket connection deferred:', wsErr);
      }
    }
  }

  // --- Settings ---
  async getSettings() {
    try {
      const res = await apiClient.get('/settings');
      return res.data;
    } catch (e) { return {}; }
  }
  async saveSettings(settings) {
    const res = await apiClient.put('/settings', settings);
    return res.data;
  }

  // --- Auth / Admin ---
  async login(username, password) {
    return await apiClient.post('/auth/login', { username, password });
  }
  async logout() {
    return await apiClient.post('/auth/logout');
  }
  async updateAdminCredentials(username, password) {
    return await apiClient.put('/auth/credentials', { username, password });
  }

  // --- Customers ---
  async getCustomers() {
    try {
      const res = await apiClient.get('/customers');
      return res.data;
    } catch (e) { return []; }
  }
  async getCustomerById(id) {
    const res = await apiClient.get(`/customers/${id}`);
    return res.data;
  }
  async saveCustomer(customer) {
    if (customer.id && !customer.id.includes('new')) {
      const res = await apiClient.put(`/customers/${customer.id}`, customer);
      return res.data;
    } else {
      const res = await apiClient.post('/customers', customer);
      return res.data;
    }
  }
  async deleteCustomer(id) {
    await apiClient.delete(`/customers/${id}`);
  }

  // --- Frames ---
  async getFrames() {
    try {
      const res = await apiClient.get('/products/frames');
      return res.data;
    } catch (e) { return []; }
  }
  async saveFrame(frame) {
    if (frame.id && !frame.id.includes('new')) {
      const res = await apiClient.put(`/products/frames/${frame.id}`, frame);
      return res.data;
    } else {
      const res = await apiClient.post('/products/frames', frame);
      return res.data;
    }
  }
  async deleteFrame(id) {
    await apiClient.delete(`/products/frames/${id}`);
  }
  async updateFrameStock(id, changeQty) {
    await apiClient.put('/inventory/update', { type: 'frame', id, quantity: changeQty });
  }

  // --- Lenses ---
  async getLenses() {
    try {
      const res = await apiClient.get('/products/lenses');
      return res.data;
    } catch (e) { return []; }
  }
  async saveLens(lens) {
    if (lens.id && !lens.id.includes('new')) {
      const res = await apiClient.put(`/products/lenses/${lens.id}`, lens);
      return res.data;
    } else {
      const res = await apiClient.post('/products/lenses', lens);
      return res.data;
    }
  }
  async deleteLens(id) {
    await apiClient.delete(`/products/lenses/${id}`);
  }
  async updateLensStock(id, changeQty) {
    await apiClient.put('/inventory/update', { type: 'lens', id, quantity: changeQty });
  }

  // --- Invoices ---
  async getInvoices() {
    try {
      const res = await apiClient.get('/billing/invoices');
      return res.data;
    } catch (e) { return []; }
  }
  async getInvoiceByNumber(invNum) {
    const res = await apiClient.get(`/billing/invoices/${invNum}`);
    return res.data;
  }
  async saveInvoice(invoice) {
    // Backend generates invoice number if empty
    const res = await apiClient.post('/billing/invoices', invoice);
    return res.data;
  }
  async updateInvoicePayment(invoiceNumber, additionalPayment, paymentMethod) {
    const res = await apiClient.put(`/billing/invoices/${invoiceNumber}/payment`, {
      amount: additionalPayment,
      paymentMethod
    });
    return res.data;
  }
  
  // --- Reports & Dashboard ---
  async getDashboardSummary() {
    try {
      const res = await apiClient.get('/reports/summary');
      return res.data;
    } catch (e) { return null; }
  }

}

export const db = new Database();
window.db = db;
