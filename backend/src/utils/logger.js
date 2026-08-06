const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFile = path.join(logDir, 'app.log');

const logger = {
  info: (msg) => {
    const timestamp = new Date().toISOString();
    const logLine = `[INFO] [${timestamp}] ${msg}\n`;
    console.log(logLine.trim());
    fs.appendFileSync(logFile, logLine);
  },
  error: (msg, err) => {
    const timestamp = new Date().toISOString();
    const logLine = `[ERROR] [${timestamp}] ${msg} ${err ? err.stack || err : ''}\n`;
    console.error(logLine.trim());
    fs.appendFileSync(logFile, logLine);
  }
};

module.exports = logger;
