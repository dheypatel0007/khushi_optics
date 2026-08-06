const fs = require('fs');
const path = require('path');

const imgPath = 'C:/Users/patel/.gemini/antigravity-ide/brain/8c30efbb-fb45-465b-8a90-0c65c9da8a15/media__1785907968562.png';
const base64Img = 'data:image/png;base64,' + fs.readFileSync(imgPath).toString('base64');

// 1. Update utils.js
const utilsPath = path.join(__dirname, '../frontend/src/utils/utils.js');
let utilsContent = fs.readFileSync(utilsPath, 'utf8');

const newQrFunc = `  generateUPIQRCode(upiId, payeeName, amount, invoiceNum) {
    const finalUpi = upiId || 'dheypatel2690-1@okicici';
    const qrDataUri = '${base64Img}';
    return \`
      <div class="qr-code-placeholder" style="background:#ffffff; padding:10px; border-radius:10px; display:inline-block; border:2px solid #0284c7; text-align:center; box-shadow:0 4px 10px rgba(0,0,0,0.1);">
        <img src="\${qrDataUri}" 
             alt="KHUSHI OPTICS Official Google Pay QR" 
             style="width:140px; height:140px; display:block; margin:0 auto; border-radius:6px; object-fit:contain;"/>
        <div style="font-size:11px; color:#0f172a; margin-top:6px; font-weight:800; font-family:sans-serif;">
          Scan to pay with any UPI app
        </div>
        <div style="font-size:10px; color:#0284c7; font-weight:700; margin-top:2px;">
          UPI ID: \${finalUpi}
        </div>
      </div>
    \`;
  },`;

utilsContent = utilsContent.replace(/  generateUPIQRCode\(upiId, payeeName, amount, invoiceNum\) \{[\s\S]*?\n  \},/, newQrFunc);
fs.writeFileSync(utilsPath, utilsContent, 'utf8');

// 2. Update index.html
const indexPath = path.join(__dirname, '../frontend/index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');

const newIndexCard = `<div id="posUpiQrPreviewCard" class="card p-3 mt-3 text-center bg-dark-card" style="display:none;">
                    <div class="text-xs text-secondary font-bold mb-2">Scan & Pay via Google Pay / Any UPI App</div>
                    <img src="${base64Img}" style="width:150px; height:150px; margin:0 auto; border-radius:8px; border:2px solid #38bdf8; object-fit:contain;" alt="UPI QR">
                    <div class="text-xs text-primary font-bold mt-2">UPI ID: dheypatel2690-1@okicici</div>
                  </div>`;

indexContent = indexContent.replace(/<div id="posUpiQrPreviewCard"[\s\S]*?<\/div>/, newIndexCard);
fs.writeFileSync(indexPath, indexContent, 'utf8');

console.log('Successfully updated QR image base64 in utils.js and index.html');
