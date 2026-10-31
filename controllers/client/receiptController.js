const { asyncHandler } = require('../../utils/asyncHandler');
const { ok, created } = require('../../utils/apiResponse');
const { ApiError } = require('../../utils/apiError');
const { assertObjectId } = require('../../utils/validateObjectId');
const { tenantFilter } = require('../../utils/tenantScope');
const receiptService = require('../../services/receiptService');
const TenantPrinterConfig = require('../../models/admin/TenantPrinterConfig');
const PrintLog = require('../../models/client/PrintLog');

const CLIENT_TYPES = ['desktop', 'web', 'mobile'];

const getSaleReceiptStructured = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id, 'saleId');
  const payload = await receiptService.buildSaleReceipt(req.params.id, req.tenantId);
  return ok(res, payload);
});

const getInvoiceReceiptStructured = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id, 'invoiceId');
  const payload = await receiptService.buildInvoiceReceipt(req.params.id, req.tenantId);
  return ok(res, payload);
});

const getPrinterConfig = asyncHandler(async (req, res) => {
  const deviceId = req.query.deviceId;
  if (!deviceId) {
    throw ApiError.badRequest('DEVICE_ID_REQUIRED', 'deviceId query param required');
  }

  const config = await TenantPrinterConfig.findOne({
    tenantId: req.tenantId,
    deviceId,
  }).lean();

  return ok(res, config || null);
});

const upsertPrinterConfig = asyncHandler(async (req, res) => {
  const { deviceId, clientType } = req.body;

  if (!deviceId || !clientType) {
    throw ApiError.badRequest('MISSING_FIELDS', 'deviceId and clientType required');
  }
  if (!CLIENT_TYPES.includes(clientType)) {
    throw ApiError.badRequest('INVALID_CLIENT', 'invalid clientType');
  }

  const update = {
    deviceId,
    clientType,
    receiptPrinter: req.body.receiptPrinter,
    labelPrinter: req.body.labelPrinter,
    autoPrintOnSale: req.body.autoPrintOnSale,
    copies: req.body.copies,
    openCashDrawerOnSale: req.body.openCashDrawerOnSale,
  };

  Object.keys(update).forEach((k) => {
    if (update[k] === undefined) delete update[k];
  });

  const doc = await TenantPrinterConfig.findOneAndUpdate(
    { tenantId: req.tenantId, deviceId },
    { $set: update },
    { upsert: true, new: true }
  ).lean();

  return ok(res, doc);
});

const createPrintLog = asyncHandler(async (req, res) => {
  const { clientType, docType, docId, docNumber, printerName, success, error, durationMs, deviceId } =
    req.body;

  if (!clientType || !docType) {
    throw ApiError.badRequest('MISSING_FIELDS', 'clientType and docType required');
  }
  if (!CLIENT_TYPES.includes(clientType)) {
    throw ApiError.badRequest('INVALID_CLIENT', 'invalid clientType');
  }

  if (docId) assertObjectId(docId, 'docId');

  const log = await PrintLog.create({
    tenantId: req.tenantId,
    deviceId: deviceId || null,
    clientType,
    docType,
    docId: docId || null,
    docNumber: docNumber || null,
    printerName: printerName || null,
    success: Boolean(success),
    error: error || null,
    durationMs: Number(durationMs) || 0,
  });

  return created(res, log.toObject());
});

const listPrintLogs = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const items = await PrintLog.find(tenantFilter(req))
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return ok(res, { data: items });
});

module.exports = {
  getSaleReceiptStructured,
  getInvoiceReceiptStructured,
  getPrinterConfig,
  upsertPrinterConfig,
  createPrintLog,
  listPrintLogs,
};