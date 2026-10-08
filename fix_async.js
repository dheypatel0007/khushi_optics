const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) results = results.concat(walk(file));
    else if (file.endsWith('.js')) results.push(file);
  });
  return results;
}

const files = walk(path.join(__dirname, 'frontend/src'));
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let original = content;

  // We are looking for something like:
  // methodName(args...) {
  //   ... await window.db ...
  // }
  
  // Actually, a simpler replace:
  const methods = [
    'renderFrameTable', 'exportFramesExcel', 'exportFramesCSV', 'saveFrameFromForm', 'deleteFrame',
    'renderLensTable', 'exportLensesExcel', 'exportLensesCSV', 'saveLensFromForm', 'deleteLens',
    'renderCustomerTable', 'exportCustomersExcel', 'exportCustomersCSV', 'saveCustomerFromForm', 'deleteAllCustomers',
    'handleCustomerSelection', 'handleFrameSelection', 'handleLensSelection', 'generateAndSaveInvoice', 'handlePaymentMethodChange', 'recalculateTotals', 'resetBillingForm',
    'setPeriod', 'setCustomRange', 'generateReports', 'getExportRows',
    'saveSettingsFromForm', 'openAddBranchModal', 'triggerQuickBackup', 'triggerRestoreBackup', 'triggerClearDataWithAutoBackup'
  ];

  methods.forEach(method => {
    content = content.replace(new RegExp(`^\\s*${method}\\s*\\(`, 'gm'), `  async ${method}(`);
  });

  if (content !== original) {
    fs.writeFileSync(f, content);
    console.log('Fixed', f);
  }
});
