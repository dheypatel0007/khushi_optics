const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    title: 'KHUSHI OPTICS - Billing & Management System',
    icon: path.join(__dirname, 'src/assets/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    },
    autoHideMenuBar: true,
    show: false
  });

  mainWindow.loadFile(path.join(__dirname, 'src/index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.maximize();
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handler: Save PDF to Documents/KHUSHI OPTICS/Bills/YYYY/Month
ipcMain.handle('save-invoice-pdf', async (event, { invoiceNumber, base64Data, dateStr }) => {
  try {
    const docsPath = app.getPath('documents');
    const invoiceDate = dateStr ? new Date(dateStr) : new Date();
    const year = invoiceDate.getFullYear().toString();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const month = monthNames[invoiceDate.getMonth()];

    const targetDir = path.join(docsPath, 'KHUSHI OPTICS', 'Bills', year, month);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const safeInvNum = invoiceNumber.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filePath = path.join(targetDir, `Invoice_${safeInvNum}.pdf`);
    
    // Clean base64 string
    const base64Clean = base64Data.replace(/^data:application\/pdf;filename=generated\.pdf;base64,/, '').replace(/^data:application\/pdf;base64,/, '');
    const buffer = Buffer.from(base64Clean, 'base64');
    
    fs.writeFileSync(filePath, buffer);
    return { success: true, path: filePath };
  } catch (error) {
    console.error('Error saving PDF:', error);
    return { success: false, error: error.message };
  }
});

// IPC Handler: Print Invoice
ipcMain.handle('print-invoice', async (event) => {
  try {
    if (mainWindow) {
      mainWindow.webContents.print({
        silent: false,
        printBackground: true,
        color: true
      }, (success, failureReason) => {
        if (!success) console.log('Print failed:', failureReason);
      });
      return { success: true };
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// IPC Handler: Export Backup
ipcMain.handle('export-backup', async (event, dataJsonString) => {
  try {
    const { filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Backup KHUSHI OPTICS Database',
      defaultPath: path.join(app.getPath('documents'), `KHUSHI_OPTICS_Backup_${new Date().toISOString().slice(0, 10)}.json`),
      filters: [{ name: 'JSON Files', extensions: ['json'] }]
    });

    if (filePath) {
      fs.writeFileSync(filePath, dataJsonString, 'utf-8');
      return { success: true, path: filePath };
    }
    return { success: false, canceled: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// IPC Handler: Import Backup
ipcMain.handle('import-backup', async () => {
  try {
    const { filePaths } = await dialog.showOpenDialog(mainWindow, {
      title: 'Restore KHUSHI OPTICS Database',
      filters: [{ name: 'JSON Files', extensions: ['json'] }],
      properties: ['openFile']
    });

    if (filePaths && filePaths.length > 0) {
      const content = fs.readFileSync(filePaths[0], 'utf-8');
      return { success: true, data: content, path: filePaths[0] };
    }
    return { success: false, canceled: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// IPC Handler: Open local folder
ipcMain.handle('open-path', async (event, targetPath) => {
  if (targetPath) {
    shell.openPath(targetPath);
  } else {
    const docsPath = path.join(app.getPath('documents'), 'KHUSHI OPTICS', 'Bills');
    if (!fs.existsSync(docsPath)) fs.mkdirSync(docsPath, { recursive: true });
    shell.openPath(docsPath);
  }
});
