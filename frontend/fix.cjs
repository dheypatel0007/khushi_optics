const fs = require('fs');
const file = 'c:/Users/patel/OneDrive/Desktop/khushi-optics-app/frontend/src/styles/styles.css';
let content = fs.readFileSync(file);
// find the last valid "}"
// The file has ~41473 bytes of good UTF-8, then bad UTF-16.
const goodString = content.toString('utf8', 0, 41473);
// Find the exact index of "}" in the good string right before the end
const lastIndex = goodString.lastIndexOf('}');
if (lastIndex !== -1) {
  // slice the buffer to right after the '}' plus a newline
  const newBuffer = content.slice(0, Buffer.byteLength(goodString.slice(0, lastIndex + 1), 'utf8'));
  
  const append = `
/* Customer Modal Rx Table Styling */
.rx-matrix-display {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.rx-table {
  width: 100%;
  max-width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  box-sizing: border-box;
}

.rx-table th,
.rx-table td {
  box-sizing: border-box;
  padding: 8px 4px;
  vertical-align: middle;
}

.rx-table th:first-child,
.rx-table td:first-child {
  width: 32%;
  text-align: left;
}

.rx-table th:not(:first-child),
.rx-table td:not(:first-child) {
  width: 13.6%;
  text-align: center;
}

.rx-table th {
  border-bottom: 1px solid #334155;
  color: #f8fafc;
  font-weight: 600;
  font-size: 0.85rem;
}

.rx-table td {
  color: #e2e8f0;
  font-size: 0.85rem;
}
`;
  
  fs.writeFileSync(file, Buffer.concat([newBuffer, Buffer.from(append, 'utf8')]));
  console.log('Fixed styles.css successfully.');
} else {
  console.log('Failed to find last brace.');
}
