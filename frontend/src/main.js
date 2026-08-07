/**
 * KHUSHI OPTICS - Frontend Entry Point
 */

import { Utils } from './utils/utils.js';
import { db } from './services/dbService.js';
import { App } from './App.js';
import { Dashboard } from './pages/Dashboard/dashboard.js';
import { Customers } from './pages/Customers/customers.js';
import { Billing } from './pages/Billing/billing.js';
import { Dues } from './pages/Billing/dues.js';
import { Frames } from './pages/Inventory/frames.js';
import { Lenses } from './pages/Inventory/lenses.js';
import { Reports } from './pages/Reports/reports.js';
import { Settings } from './pages/Settings/settings.js';

// Attach modules to window object for legacy inline event handlers (onclick="...")
window.Utils = Utils;
window.db = db;
window.App = App;
window.Dashboard = Dashboard;
window.Customers = Customers;
window.Billing = Billing;
window.Dues = Dues;
window.Frames = Frames;
window.Lenses = Lenses;
window.Reports = Reports;
window.Settings = Settings;

document.addEventListener('DOMContentLoaded', () => {
  App.init();

  // Listen for Real-Time WebSocket and Cloud Database Sync events to re-render active UI instantly
  window.addEventListener('cloud_sync', (e) => {
    console.log('🔄 Real-Time Cloud Sync trigger received. Refreshing active screen...', e.detail);
    if (App.currentView === 'dashboardView' && Dashboard.render) Dashboard.render();
    else if (App.currentView === 'customersView' && Customers.renderTable) Customers.renderTable();
    else if (App.currentView === 'billingView' && Billing.renderRecentInvoices) Billing.renderRecentInvoices();
    else if (App.currentView === 'duesView' && Dues.renderTable) Dues.renderTable();
    else if (App.currentView === 'framesView' && Frames.renderTable) Frames.renderTable();
    else if (App.currentView === 'lensesView' && Lenses.renderTable) Lenses.renderTable();
    else if (App.currentView === 'reportsView' && Reports.generateReport) Reports.generateReport();
    else if (App.currentView === 'settingsView' && Settings.populateFields) Settings.populateFields();
  });
});
