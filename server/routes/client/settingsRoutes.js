const express = require('express');
const multer = require('multer');
const router = express.Router();

const settingsController = require('../../controllers/client/settingsController');
const auth = require('../../middleware/client/auth');
const period = require('../../middleware/client/period');
const requireRole = require('../../middleware/client/role');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } });

router.use(auth, period);

router.get('/', settingsController.get);
router.put('/', requireRole(['owner', 'manager']), settingsController.update);
router.post('/logo', requireRole(['owner']), upload.single('file'), settingsController.uploadLogo);
router.put('/receipt', requireRole(['owner', 'manager']), settingsController.updateReceipt);
router.put('/tax', requireRole(['owner', 'manager']), settingsController.updateTax);

module.exports = router;