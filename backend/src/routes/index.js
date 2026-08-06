const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const customerRoutes = require('./customers');
const productRoutes = require('./products');
const billingRoutes = require('./billing');
const inventoryRoutes = require('./inventory');
const reportRoutes = require('./reports');
const settingRoutes = require('./settings');
const healthRoutes = require('./health');

router.use('/auth', authRoutes);
router.use('/customers', customerRoutes);
router.use('/products', productRoutes);
router.use('/billing', billingRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/reports', reportRoutes);
router.use('/settings', settingRoutes);
router.use('/health', healthRoutes);

module.exports = router;
