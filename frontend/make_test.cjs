const fs = require('fs');
let utilsJs = fs.readFileSync('src/utils/utils.js', 'utf8').replace(/export const Utils =/g, 'const Utils =');
let dbJs = fs.readFileSync('src/services/dbService.js', 'utf8').replace(/export class Database/g, 'class Database').replace(/export const db = new Database\(\);/, '').replace(/window\.db = db;/, '');
let billingJs = fs.readFileSync('src/pages/Billing/billing.js', 'utf8').replace(/export const Billing =/g, 'const Billing =').replace(/import .*/g, '');

const code = `
  const window = { html2pdf: () => ({ set: () => ({ from: () => ({ outputPdf: async () => 'pdfdata', save: async () => {} }) }) }) };
  const document = {
    getElementById: (id) => {
      if (id === 'posExtraChargesInput') return null;
      return { value: 'test', style: {}, dataset: {}, classList: {add: ()=>{}, remove: ()=>{}}, appendChild: ()=>{}, innerHTML: '' };
    },
    createElement: () => ({ classList: {add: ()=>{}, remove: ()=>{}}, appendChild: ()=>{}, style: {}, setAttribute: ()=>{}, parentNode: { insertBefore: ()=>{} } }),
    querySelector: () => ({ insertBefore: ()=>{} }),
    body: { appendChild: ()=>{}, removeChild: ()=>{} }
  };
  const localStorage = {
    getItem: () => null,
    setItem: () => {}
  };
  ${utilsJs}
  window.Utils = Utils;
  Utils.openModal = () => console.log('MODAL OPENED');
  ${dbJs}
  const db = new Database();
  window.db = db;
  ${billingJs}

  (async () => {
    try {
      Billing.activeInvoice.customer = { id: 'test', name: 'Test' };
      Billing.activeInvoice.selectedFrame = { id: 'f1', sellingPrice: 100 };
      await Billing.generateAndSaveInvoice();
      console.log('SUCCESS');
    } catch(e) {
      console.log('ERROR:', e.message, e.stack);
    }
  })();
`;

fs.writeFileSync('test_billing_exec.js', code);
