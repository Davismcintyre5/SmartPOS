const express = require('express');
const router = express.Router();

const staffController = require('../../controllers/client/staffController');
const auth = require('../../middleware/client/auth');
const period = require('../../middleware/client/period');
const requireRole = require('../../middleware/client/role');

router.use(auth, period);

router.get('/', requireRole(['owner', 'manager']), staffController.list);
router.post('/invite', requireRole(['owner']), staffController.invite);
router.put('/:id', requireRole(['owner']), staffController.update);
router.delete('/:id', requireRole(['owner']), staffController.deactivate);
router.post('/:id/role', requireRole(['owner']), staffController.assignRole);
router.post('/:id/reset-pin', requireRole(['owner', 'manager']), staffController.resetPin);

module.exports = router;