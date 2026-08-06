const inputValidator = {
  validateCustomer: (data) => {
    if (!data.name || data.name.trim() === '') return 'Customer name is required';
    if (!data.mobile || data.mobile.trim() === '') return 'Mobile number is required';
    return null;
  },
  validateFrame: (data) => {
    if (!data.brand || data.brand.trim() === '') return 'Frame brand is required';
    if (!data.model || data.model.trim() === '') return 'Frame model is required';
    if (data.sellingPrice === undefined || data.sellingPrice < 0) return 'Valid selling price is required';
    return null;
  },
  validateLens: (data) => {
    if (!data.company || data.company.trim() === '') return 'Lens company name is required';
    if (!data.name || data.name.trim() === '') return 'Lens name is required';
    if (data.sellingPrice === undefined || data.sellingPrice < 0) return 'Valid selling price is required';
    return null;
  },
  validateInvoice: (data) => {
    if (!data.customerId) return 'Customer selection is required';
    if (data.netTotal === undefined || data.netTotal < 0) return 'Valid invoice total is required';
    return null;
  }
};

module.exports = inputValidator;
