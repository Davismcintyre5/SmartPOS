const express = require('express');
const router = express.Router();

const receiptController = require('../../controllers/client/receiptController');
const auth = require('../../middleware/client/auth');
const period = require('../../middleware/client/period');

router.use(auth, period);

router.get('/:saleId', receiptController.getReceipt);
router.post('/:saleId/print', receiptController.printReceipt);
router.post('/:saleId/email', receiptController.emailReceipt);
router.post('/:saleId/sms', receiptController.smsReceipt);

module.exports = router;