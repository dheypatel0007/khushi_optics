const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

router.get('/alerts', inventoryController.getAlerts);
router.post('/update-qty', inventoryController.updateQuantity);

module.exports = router;
