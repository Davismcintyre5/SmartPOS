const { Router } = require('express');
const c = require('../../controllers/client/settingsController');
const { roles } = require('../../middleware/client/roles');
const { requireActive } = require('../../middleware/client/statusGuard');

const router = Router();

router.get('/', c.get);

router.patch('/', requireActive, roles('owner'), c.update);
router.post('/payments/:code/enable', requireActive, roles('owner'), c.enablePayment);
router.delete('/payments/:code', requireActive, roles('owner'), c.disablePayment);

module.exports = router;