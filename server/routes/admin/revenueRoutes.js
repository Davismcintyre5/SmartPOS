const express = require('express');
const router = express.Router();

const revenueController = require('../../controllers/admin/revenueController');
const adminAuth = require('../../middleware/admin/adminAuth');

router.use(adminAuth);

router.get('/summary', revenueController.summary);
router.get('/by-plan', revenueController.byPlan);
router.get('/by-currency', revenueController.byCurrency);
router.get('/by-method', revenueController.byMethod);
router.get('/monthly', revenueController.monthly);

module.exports = router;