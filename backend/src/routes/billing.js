const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');

router.get('/', billingController.getAllInvoices);
router.get('/:invNum', billingController.getInvoiceByNumber);
router.post('/', billingController.createInvoice);
router.post('/collect/:invNum', billingController.collectPayment);

module.exports = router;
