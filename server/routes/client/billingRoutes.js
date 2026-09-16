const express = require('express');
const router = express.Router();

const billingController = require('../../controllers/client/billingController');
const auth = require('../../middleware/client/auth');
const period = require('../../middleware/client/period');
const requireRole = require('../../middleware/client/role');

router.get('/subscription', auth, billingController.getSubscription);
router.post('/portal', auth, requireRole(['owner']), billingController.createPortalSession);
router.get('/payments', auth, billingController.listPayments);
router.post('/upgrade', auth, requireRole(['owner']), billingController.upgrade);

module.exports = router;