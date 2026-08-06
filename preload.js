const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveInvoicePDF: (invoiceData) => ipcRenderer.invoke('save-invoice-pdf', invoiceData),
  printInvoice: () => ipcRenderer.invoke('print-invoice'),
  exportBackup: (jsonData) => ipcRenderer.invoke('export-backup', jsonData),
  importBackup: () => ipcRenderer.invoke('import-backup'),
  openBillsDirectory: (dirPath) => ipcRenderer.invoke('open-path', dirPath)
});
