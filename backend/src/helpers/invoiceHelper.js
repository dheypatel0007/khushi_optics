const invoiceHelper = {
  calculateTotals: (framePrice = 0, lensPrice = 0, fittingCharge = 0, discountPercent = 0, gstEnabled = true, gstRate = 12) => {
    const gross = (parseFloat(framePrice) || 0) + (parseFloat(lensPrice) || 0) + (parseFloat(fittingCharge) || 0);
    const discAmount = (gross * (parseFloat(discountPercent) || 0)) / 100;
    const subtotal = gross - discAmount;
    
    let cgst = 0;
    let sgst = 0;
    if (gstEnabled) {
      const halfRate = (parseFloat(gstRate) || 12) / 2;
      cgst = (subtotal * halfRate) / 100;
      sgst = (subtotal * halfRate) / 100;
    }
    
    const netTotal = subtotal + cgst + sgst;
    return {
      gross,
      discountAmount: discAmount,
      subtotal,
      cgstAmount: cgst,
      sgstAmount: sgst,
      netTotal
    };
  }
};

module.exports = invoiceHelper;
