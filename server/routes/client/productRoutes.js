const express = require('express');
const multer = require('multer');
const router = express.Router();

const productController = require('../../controllers/client/productController');
const auth = require('../../middleware/client/auth');
const period = require('../../middleware/client/period');
const requireRole = require('../../middleware/client/role');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.use(auth, period);

router.get('/', productController.list);
router.get('/barcode/:code', productController.findByBarcode);
router.post('/', requireRole(['owner', 'manager']), productController.create);
router.get('/export', productController.exportCsv);
router.post('/import', requireRole(['owner', 'manager']), upload.single('file'), productController.importCsv);
router.get('/:id', productController.getOne);
router.put('/:id', requireRole(['owner', 'manager']), productController.update);
router.delete('/:id', requireRole(['owner', 'manager']), productController.remove);
router.post('/:id/image', requireRole(['owner', 'manager']), upload.single('file'), productController.uploadImage);

module.exports = router;