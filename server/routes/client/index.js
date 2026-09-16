const express = require('express');
const router = express.Router();

const productRoutes = require('./productRoutes');
const categoryRoutes = require('./categoryRoutes');
const saleRoutes = require('./saleRoutes');
const inventoryRoutes = require('./inventoryRoutes');
const customerRoutes = require('./customerRoutes');
const reportRoutes = require('./reportRoutes');
const staffRoutes = require('./staffRoutes');
const settingsRoutes = require('./settingsRoutes');
const syncRoutes = require('./syncRoutes');
const billingRoutes = require('./billingRoutes');
const receiptRoutes = require('./receiptRoutes');

router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/sales', saleRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/customers', customerRoutes);
router.use('/reports', reportRoutes);
router.use('/staff', staffRoutes);
router.use('/settings', settingsRoutes);
router.use('/sync', syncRoutes);
router.use('/billing', billingRoutes);
router.use('/receipts', receiptRoutes);

module.exports = router;