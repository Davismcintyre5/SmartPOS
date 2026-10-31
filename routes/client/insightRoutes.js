const { Router } = require('express');
const c = require('../../controllers/client/insightController');
const { roles } = require('../../middleware/client/roles');
const { requireActive } = require('../../middleware/client/statusGuard');

const router = Router();

router.use(requireActive);

router.get('/today', c.today);
router.get('/stock-alerts', c.stockAlerts);

router.get('/range', roles('owner', 'manager'), c.range);

module.exports = router;