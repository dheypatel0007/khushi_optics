const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.js')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = [
  ...walk(path.join(__dirname, 'frontend/src/pages')),
  path.join(__dirname, 'frontend/src/App.js')
];

let totalReplaced = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Add async to specific methods that we know use db.get...
  const methodsToAsyncify = [
    'render() {',
    'populateBranchFilter() {',
    'updateStatCards() {',
    'renderLowStockAlerts() {',
    'renderRecentBills() {',
    'renderSalesChart() {',
    'loadLenses() {',
    'viewLensDetails(',
    'openAddLensModal(',
    'loadFrames() {',
    'viewFrameDetails(',
    'openAddFrameModal(',
    'loadCustomers() {',
    'viewCustomerHistory(',
    'openAddCustomerModal(',
    'populateSelectors() {',
    'onCustomerSelect(',
    'onFrameSelect(',
    'onLensSelect(',
    'loadInvoices() {',
    'viewInvoiceDetails(',
    'collectPayment(',
    'loadDues() {',
    'login(',
    'applySavedTheme() {',
    'toggleTheme() {',
    'updateShopBranding() {',
    'handleGlobalSearch(',
    'init() {'
  ];

  methodsToAsyncify.forEach(method => {
    // Basic string replace, handles both function styles
    content = content.replace(new RegExp(`(\\b)${method.replace('(', '\\(').replace(')', '\\)')}`, 'g'), `$1async ${method}`);
  });

  // Convert window.db.get...() to await window.db.get...()
  content = content.replace(/window\.db\.get/g, 'await window.db.get');

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    console.log('Updated', file);
    totalReplaced++;
  }
});

console.log('Total files updated:', totalReplaced);
