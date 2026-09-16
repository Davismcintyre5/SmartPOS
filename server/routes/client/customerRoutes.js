const express = require('express');
const router = express.Router();

const customerController = require('../../controllers/client/customerController');
const auth = require('../../middleware/client/auth');
const period = require('../../middleware/client/period');

router.use(auth, period);

router.get('/', customerController.list);
router.get('/search', customerController.search);
router.post('/', customerController.create);
router.get('/:id', customerController.getOne);
router.put('/:id', customerController.update);
router.post('/:id/loyalty', customerController.adjustLoyalty);

module.exports = router;