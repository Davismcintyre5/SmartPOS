const express = require('express');
const router = express.Router();

const webhookController = require('../../controllers/public/webhookController');

router.post('/stripe', express.raw({ type: 'application/json' }), webhookController.stripeWebhook);
router.post('/paypal', express.json(), webhookController.paypalWebhook);
router.post('/mpesa/stk', express.json(), webhookController.mpesaStkCallback);
router.post('/mpesa/c2b', express.json(), webhookController.mpesaC2bCallback);

module.exports = router;