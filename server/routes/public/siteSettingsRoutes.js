const express = require('express');
const router = express.Router();

const siteController = require('../../controllers/public/siteController');

router.get('/', siteController.getSite);
router.get('/plans', siteController.getPlans);
router.get('/payment-methods', siteController.getPaymentMethods);

module.exports = router;