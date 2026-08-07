/**
 * KHUSHI OPTICS - Main Application Controller
 */

import { Utils } from './utils/utils.js';

export const App = {
  currentView: 'dashboardView',
  isLoggedIn: false,

  async init() {
    this.checkAuth();
    this.setupEventListeners();
    this.setupKeyboardShortcuts();
    this.applySavedTheme();
    this.updateShopBranding();
    this.updateClock();
    setInterval(() => this.updateClock(), 1000);
  },

  checkAuth() {
    const isLogged = sessionStorage.getItem('khushi_logged_in') === 'true' || localStorage.getItem('khushi_logged_in') === 'true';
    if (isLogged) {
      this.isLoggedIn = true;
      this.showAppLayout();
      this.navigateTo('dashboardView');
    } else {
      this.isLoggedIn = false;
      this.showLoginView();
    }
  },

  showLoginView() {
    const loginView = document.getElementById('loginContainer');
    const appView = document.getElementById('appContainer');
    if (loginView) loginView.style.display = 'flex';
    if (appView) appView.style.display = 'none';
    
    const userField = document.getElementById('loginUsername');
    const passField = document.getElementById('loginPassword');
    if (userField && !userField.value) userField.value = '';
    if (passField) passField.value = '';
  },

  showAppLayout() {
    const loginView = document.getElementById('loginContainer');
    const appView = document.getElementById('appContainer');
    if (loginView) loginView.style.display = 'none';
    if (appView) appView.style.display = 'flex';
  },

  async login(username, password, remember) {
    const admin = window.db ? await window.db.getAdmin() : { username: 'dheypatel2690@gmail.com', passwordHash: 'dheypatel0007' };
    if (username === admin.username && password === admin.passwordHash) {
      sessionStorage.setItem('khushi_logged_in', 'true');
      if (remember) {
        localStorage.setItem('khushi_logged_in', 'true');
      } else {
        localStorage.removeItem('khushi_logged_in');
      }
      this.isLoggedIn = true;
      this.showAppLayout();
      this.navigateTo('dashboardView');
      Utils.showToast(`Welcome to KHUSHI OPTICS! Logged in successfully.`, 'success');
      return true;
    } else {
      Utils.showToast('Invalid Email or Password! Access Denied.', 'error');
      return false;
    }
  },

  logout() {
    sessionStorage.removeItem('khushi_logged_in');
    localStorage.removeItem('khushi_logged_in');
    this.isLoggedIn = false;
    this.showLoginView();
    const userField = document.getElementById('loginUsername');
    const passField = document.getElementById('loginPassword');
    if (userField) userField.value = '';
    if (passField) passField.value = '';
    Utils.showToast('Logged out securely', 'info');
  },

  navigateTo(viewId) {
    if (!this.isLoggedIn) {
      this.showLoginView();
      return;
    }

    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.classList.remove('mobile-open');
    if (overlay) overlay.classList.remove('active');

    document.querySelectorAll('.view-section').forEach(view => {
      view.classList.remove('active');
      view.style.display = 'none';
    });

    document.querySelectorAll('.sidebar-menu-item').forEach(item => {
      item.classList.remove('active');
    });

    const targetView = document.getElementById(viewId);
    if (targetView) {
      targetView.style.display = 'block';
      setTimeout(() => targetView.classList.add('active'), 10);
      this.currentView = viewId;

      const navBtn = document.querySelector(`[data-view="${viewId}"]`);
      if (navBtn) navBtn.classList.add('active');

      if (viewId === 'dashboardView' && window.Dashboard) window.Dashboard.render();
      if (viewId === 'billingView' && window.Billing) window.Billing.render();
      if (viewId === 'customersView' && window.Customers) window.Customers.render();
      if (viewId === 'framesView' && window.Frames) window.Frames.render();
      if (viewId === 'lensesView' && window.Lenses) window.Lenses.render();
      if (viewId === 'duesView' && window.Dues) window.Dues.render();
      if (viewId === 'reportsView' && window.Reports) window.Reports.render();
      if (viewId === 'settingsView' && window.Settings) window.Settings.render();
    }
  },

  setupEventListeners() {
    document.querySelectorAll('[data-view]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const viewId = btn.getAttribute('data-view');
        this.navigateTo(viewId);
      });
    });

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const u = document.getElementById('loginUsername').value.trim();
        const p = document.getElementById('loginPassword').value.trim();
        const r = document.getElementById('loginRemember')?.checked;
        this.login(u, p, r);
      });
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.logout());
    }

    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', () => {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        if (sidebar) sidebar.classList.toggle('mobile-open');
        if (overlay) overlay.classList.toggle('active');
      });
    }

    const sidebarOverlay = document.getElementById('sidebarOverlay');
    if (sidebarOverlay) {
      sidebarOverlay.addEventListener('click', () => {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) sidebar.classList.remove('mobile-open');
        sidebarOverlay.classList.remove('active');
      });
    }

    // Password toggle for login
    const togglePasswordBtn = document.getElementById('togglePasswordBtn');
    if (togglePasswordBtn) {
      togglePasswordBtn.addEventListener('click', () => {
        const pwInput = document.getElementById('loginPassword');
        if (pwInput) {
          pwInput.type = pwInput.type === 'password' ? 'text' : 'password';
        }
      });
    }

    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => this.toggleTheme());
    }

    const globalSearchInput = document.getElementById('globalSearchInput');
    if (globalSearchInput) {
      globalSearchInput.addEventListener('input', (e) => {
        this.handleGlobalSearch(e.target.value.trim());
      });
    }

    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
      changePasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const currentP = document.getElementById('currentPassword').value;
        const newP = document.getElementById('newPassword').value;
        const confirmP = document.getElementById('confirmPassword').value;
        const admin = window.db ? await window.db.getAdmin() : { passwordHash: 'dheypatel0007' };

        if (currentP !== admin.passwordHash) {
          Utils.showToast('Current password is incorrect', 'error');
          return;
        }
        if (newP.length < 4) {
          Utils.showToast('New password must be at least 4 characters long', 'warning');
          return;
        }
        if (newP !== confirmP) {
          Utils.showToast('New passwords do not match', 'error');
          return;
        }

        admin.passwordHash = newP;
        if (window.db) window.db.updateAdminCredentials(admin.username, newP);
        Utils.closeModal('changePasswordModal');
        Utils.showToast('Password changed successfully!', 'success');
        changePasswordForm.reset();
      });
    }

    window.addEventListener('cloud_sync', (e) => {
      console.log('App reacting to cloud_sync event');
      // Re-render the current view to reflect real-time updates
      if (this.currentView === 'dashboardView' && window.Dashboard) window.Dashboard.render();
      if (this.currentView === 'billingView' && window.Billing) window.Billing.render();
      if (this.currentView === 'customersView' && window.Customers) window.Customers.render();
      if (this.currentView === 'framesView' && window.Frames) window.Frames.render();
      if (this.currentView === 'lensesView' && window.Lenses) window.Lenses.render();
      if (this.currentView === 'duesView' && window.Dues) window.Dues.render();
      if (this.currentView === 'reportsView' && window.Reports) window.Reports.render();
      if (this.currentView === 'settingsView' && window.Settings) window.Settings.render();
    });
  },

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'F2') {
        e.preventDefault();
        this.navigateTo('billingView');
      } else if (e.key === 'F3') {
        e.preventDefault();
        if (this.currentView !== 'customersView') this.navigateTo('customersView');
        if (window.Customers) window.Customers.openAddCustomerModal();
      } else if (e.key === 'F4') {
        e.preventDefault();
        const searchInput = document.getElementById('globalSearchInput');
        if (searchInput) searchInput.focus();
      } else if (e.key === 'F9') {
        e.preventDefault();
        if (window.Settings) window.Settings.triggerQuickBackup();
      }
    });
  },

  async applySavedTheme() {
    const settings = window.db ? await window.db.getSettings() : { theme: 'dark' };
    const theme = settings.theme || 'dark';
    document.body.setAttribute('data-theme', theme);
  },

  async toggleTheme() {
    const settings = window.db ? await window.db.getSettings() : { theme: 'dark' };
    const newTheme = settings.theme === 'light' ? 'dark' : 'light';
    settings.theme = newTheme;
    if (window.db) window.db.saveSettings(settings);
    document.body.setAttribute('data-theme', newTheme);
    Utils.showToast(`Switched to ${newTheme.toUpperCase()} theme`, 'info');
  },

  async updateShopBranding() {
    const settings = window.db ? await window.db.getSettings() : { shopName: 'KHUSHI OPTICS' };
    document.querySelectorAll('.shop-brand-name').forEach(el => el.textContent = settings.shopName || 'KHUSHI OPTICS');
    document.querySelectorAll('.shop-brand-phone').forEach(el => el.textContent = `${settings.phone1 || '9824735065'} | ${settings.phone2 || '9265778527'}`);
    document.querySelectorAll('.shop-brand-address').forEach(el => el.textContent = settings.address || '');
  },

  updateClock() {
    const clockEl = document.getElementById('headerClock');
    if (clockEl) {
      const now = new Date();
      clockEl.textContent = now.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }) + ' | ' + now.toLocaleTimeString('en-IN');
    }
  },

  async handleGlobalSearch(query) {
    if (!query) {
      const dropdown = document.getElementById('globalSearchResults');
      if (dropdown) dropdown.style.display = 'none';
      return;
    }

    const q = query.toLowerCase();
    const customers = window.db ? await window.db.getCustomers().filter(c => c.name.toLowerCase().includes(q) || c.mobile.includes(q)) : [];
    const frames = window.db ? await window.db.getFrames().filter(f => f.brand.toLowerCase().includes(q) || f.model.toLowerCase().includes(q) || f.id.toLowerCase().includes(q)) : [];
    const invoices = window.db ? await window.db.getInvoices().filter(i => i.invoiceNumber.toLowerCase().includes(q) || i.customerName.toLowerCase().includes(q)) : [];

    let html = '';
    
    if (customers.length) {
      html += `<div class="search-category-title">Customers</div>`;
      customers.slice(0, 3).forEach(c => {
        html += `<div class="search-result-item" onclick="App.navigateTo('customersView'); window.Customers.viewCustomerHistory('${c.id}'); App.closeGlobalSearch();">
          <strong>${c.name}</strong> (${c.mobile})
        </div>`;
      });
    }

    if (invoices.length) {
      html += `<div class="search-category-title">Invoices</div>`;
      invoices.slice(0, 3).forEach(inv => {
        html += `<div class="search-result-item" onclick="App.navigateTo('billingView'); window.Billing.viewInvoiceDetails('${inv.invoiceNumber}'); App.closeGlobalSearch();">
          <strong>${inv.invoiceNumber}</strong> - ${inv.customerName} (${Utils.formatCurrency(inv.netTotal)})
        </div>`;
      });
    }

    if (frames.length) {
      html += `<div class="search-category-title">Frames Stock</div>`;
      frames.slice(0, 3).forEach(f => {
        html += `<div class="search-result-item" onclick="App.navigateTo('framesView'); App.closeGlobalSearch();">
          <strong>${f.brand} ${f.model}</strong> (${f.id}) - Qty: ${f.quantity}
        </div>`;
      });
    }

    if (!html) {
      html = `<div class="search-result-item text-muted">No matching customer, invoice, or stock item found</div>`;
    }

    let dropdown = document.getElementById('globalSearchResults');
    if (!dropdown) {
      dropdown = document.createElement('div');
      dropdown.id = 'globalSearchResults';
      dropdown.className = 'global-search-results';
      document.querySelector('.header-search-wrapper').appendChild(dropdown);
    }
    dropdown.innerHTML = html;
    dropdown.style.display = 'block';
  },

  closeGlobalSearch() {
    const dropdown = document.getElementById('globalSearchResults');
    if (dropdown) dropdown.style.display = 'none';
    const input = document.getElementById('globalSearchInput');
    if (input) input.value = '';
  }
};

window.App = App;
