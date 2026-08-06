const fs = require('fs');
const path = require('path');

// 1. Clean utils.js
const utilsPath = path.join(__dirname, '../frontend/src/utils/utils.js');
if (fs.existsSync(utilsPath)) {
  let utilsContent = fs.readFileSync(utilsPath, 'utf8');

  const cleanQrFunc = `  generateUPIQRCode(upiId, payeeName, amount, invoiceNum) {
    const finalUpi = upiId || 'dheypatel2690-1@okicici';
    return \`
      <div class="qr-code-placeholder" style="background:#ffffff; padding:10px; border-radius:10px; display:inline-block; border:2px solid #0284c7; text-align:center; box-shadow:0 4px 10px rgba(0,0,0,0.1);">
        <img src="/images/upi-qr-code.png" 
             alt="KHUSHI OPTICS Official Google Pay QR" 
             style="width:130px; height:130px; display:block; margin:0 auto; border-radius:6px; object-fit:contain;"
             onerror="this.onerror=null; this.src='https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=upi://pay?pa=dheypatel2690-1@okicici%26pn=KHUSHI%20OPTICS';"/>
        <div style="font-size:11px; color:#0f172a; margin-top:6px; font-weight:800; font-family:sans-serif;">
          Scan to pay with any UPI app
        </div>
        <div style="font-size:10px; color:#0284c7; font-weight:700; margin-top:2px;">
          UPI ID: \${finalUpi}
        </div>
      </div>
    \`;
  },`;

  utilsContent = utilsContent.replace(/  generateUPIQRCode\(upiId, payeeName, amount, invoiceNum\) \{[\s\S]*?\n  \},/, cleanQrFunc);
  fs.writeFileSync(utilsPath, utilsContent, 'utf8');
  console.log('Successfully cleaned QR generator in frontend/src/utils/utils.js');
}

// 2. Clean frontend/index.html QR section
const indexPath = path.join(__dirname, '../frontend/index.html');
if (fs.existsSync(indexPath)) {
  let indexContent = fs.readFileSync(indexPath, 'utf8');

  const cleanIndexCard = `<div id="posUpiQrPreviewCard" class="card p-3 mt-3 text-center bg-dark-card" style="display:none;">
                    <div class="text-xs text-secondary font-bold mb-2">Scan & Pay via Google Pay / Any UPI App</div>
                    <img src="/images/upi-qr-code.png" style="width:140px; height:140px; margin:0 auto; border-radius:8px; border:2px solid #38bdf8; object-fit:contain;" alt="UPI QR">
                    <div class="text-xs text-primary font-bold mt-2">UPI ID: dheypatel2690-1@okicici</div>
                  </div>`;

  indexContent = indexContent.replace(/<div id="posUpiQrPreviewCard"[\s\S]*?UPI ID: dheypatel2690-1@okicici<\/div>\s*<\/div>\s*<\/div>/, cleanIndexCard + '\n                </div>\n              </div>');
  fs.writeFileSync(indexPath, indexContent, 'utf8');
  console.log('Successfully cleaned QR card in frontend/index.html');
}
