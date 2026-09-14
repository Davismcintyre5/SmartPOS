const express = require('express');
const router = express.Router();

const analyticsController = require('../../controllers/admin/analyticsController');
const adminAuth = require('../../middleware/admin/adminAuth');

router.use(adminAuth);

router.get('/signups', analyticsController.signupsOverTime);
router.get('/trial-conversion', analyticsController.trialConversion);
router.get('/churn', analyticsController.churn);
router.get('/plan-distribution', analyticsController.planDistribution);
router.get('/currency-distribution', analyticsController.currencyDistribution);
router.get('/status-distribution', analyticsController.statusDistribution);

module.exports = router;