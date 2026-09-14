const express = require('express');
const router = express.Router();

const healthController = require('../../controllers/public/healthController');

router.get('/', healthController.health);
router.get('/ready', healthController.ready);

module.exports = router;