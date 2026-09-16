const express = require('express');
const router = express.Router();

const inventoryController = require('../../controllers/client/inventoryController');
const auth = require('../../middleware/client/auth');
const period = require('../../middleware/client/period');
const requireRole = require('../../middleware/client/role');

router.use(auth, period);

router.get('/stock/:productId', inventoryController.getStock);
router.post('/adjust', requireRole(['owner', 'manager']), inventoryController.adjust);
router.get('/movements', inventoryController.listMovements);
router.get('/low-stock', inventoryController.lowStock);

module.exports = router;