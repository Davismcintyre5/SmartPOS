const express = require('express');
const router = express.Router();

const saleController = require('../../controllers/client/saleController');
const auth = require('../../middleware/client/auth');
const period = require('../../middleware/client/period');
const requireRole = require('../../middleware/client/role');

router.use(auth, period);

router.get('/', saleController.list);
router.get('/summary/today', saleController.todaySummary);
router.post('/', saleController.create);
router.get('/:id', saleController.getOne);
router.post('/:id/refund', requireRole(['owner', 'manager']), saleController.refund);
router.post('/:id/void', requireRole(['owner', 'manager']), saleController.voidSale);

module.exports = router;