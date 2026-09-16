const express = require('express');
const router = express.Router();

const categoryController = require('../../controllers/client/categoryController');
const auth = require('../../middleware/client/auth');
const period = require('../../middleware/client/period');
const requireRole = require('../../middleware/client/role');

router.use(auth, period);

router.get('/', categoryController.list);
router.post('/', requireRole(['owner', 'manager']), categoryController.create);
router.post('/reorder', requireRole(['owner', 'manager']), categoryController.reorder);
router.get('/:id', categoryController.getOne);
router.put('/:id', requireRole(['owner', 'manager']), categoryController.update);
router.delete('/:id', requireRole(['owner', 'manager']), categoryController.remove);

module.exports = router;