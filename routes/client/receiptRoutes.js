const { Router } = require('express');
const rc = require('../../controllers/client/receiptStructuredController');

const router = Router();

router.get('/structured/sale/:id', rc.getSaleReceiptStructured);
router.get('/structured/invoice/:id', rc.getInvoiceReceiptStructured);

router.get('/printers', rc.getPrinterConfig);
router.put('/printers', rc.upsertPrinterConfig);
router.get('/printers/devices', rc.listDevices);
router.delete('/printers/devices/:deviceId', rc.deleteDevice);

router.post('/logs', rc.createPrintLog);
router.get('/logs', rc.listPrintLogs);

module.exports = router;