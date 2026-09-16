const express = require('express');
const router = express.Router();

const syncController = require('../../controllers/client/syncController');
const auth = require('../../middleware/client/auth');
const period = require('../../middleware/client/period');

router.use(auth, period);

router.post('/push', syncController.push);
router.get('/pull', syncController.pull);
router.get('/status', syncController.status);

module.exports = router;