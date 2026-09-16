const express = require('express');
const router = express.Router();

const reportController = require('../../controllers/client/reportController');
const auth = require('../../middleware/client/auth');
const period = require('../../middleware/client/period');
const requireRole = require('../../middleware/client/role');

router.use(auth, period);

router.get('/daily', reportController.dailySales);
router.get('/range', reportController.salesByRange);
router.get('/top-products', reportController.topProducts);
router.get('/by-cashier', requireRole(['owner', 'manager']), reportController.salesByCashier);
router.get('/tax-summary', requireRole(['owner', 'manager']), reportController.taxSummary);
router.get('/dashboard', reportController.dashboard);

module.exports = router;