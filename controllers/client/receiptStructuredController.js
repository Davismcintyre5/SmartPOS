const { asyncHandler } = require('../../utils/asyncHandler');
const { ok, created, noContent } = require('../../utils/apiResponse');
const { ApiError } = require('../../utils/apiError');
const { assertObjectId } = require('../../utils/validateObjectId');
const { tenantFilter } = require('../../utils/tenantScope');
const receiptService = require('../../services/receiptService');
const TenantPrinterConfig = require('../../models/admin/TenantPrinterConfig');
const PrintLog = require('../../models/client/PrintLog');

const CLIENT_TYPES = ['desktop', 'web', 'mobile'];
const DRIVER_MODES = ['browser_print', 'thermal_usb', 'thermal_relay', 'thermal_ble', 'none'];
const PRINTER_TYPES = ['thermal_58mm', 'thermal_80mm', 'laser', 'label'];
const CONNECTION_TYPES = ['usb', 'network', 'bluetooth', 'serial'];
const SCANNER_MODES = ['keyboard_wedge', 'camera', 'bluetooth'];
const SCANNER_SUFFIX = ['Enter', 'Tab', 'None'];
const DRAWER_MODES = ['via_printer', 'usb', 'serial', 'none'];
const DRAWER_KICKS = ['ESC_P', 'ESC_p', 'custom'];

function pickEnum(value, allowed, field) {
  if (value === undefined) return undefined;
  if (!allowed.includes(value)) {
    throw ApiError.badRequest('INVALID_VALUE', `${field} must be one of: ${allowed.join(', ')}`);
  }
  return value;
}

function pickNumber(value, field, { min = 0, max = 9999, integer = true } = {}) {
  if (value === undefined) return undefined;
  const n = Number(value);
  if (Number.isNaN(n) || n < min || n > max) {
    throw ApiError.badRequest('INVALID_VALUE', `${field} must be a number between ${min} and ${max}`);
  }
  if (integer && !Number.isInteger(n)) {
    throw ApiError.badRequest('INVALID_VALUE', `${field} must be an integer`);
  }
  return n;
}

function pickBool(value) {
  if (value === undefined) return undefined;
  return Boolean(value);
}

function cleanPrinterSection(input) {
  if (!input || typeof input !== 'object') return undefined;
  const out = {};
  if (input.name !== undefined) out.name = input.name ? String(input.name) : null;
  if (input.type !== undefined) out.type = pickEnum(input.type, PRINTER_TYPES, 'receiptPrinter.type');
  if (input.connection !== undefined) out.connection = pickEnum(input.connection, CONNECTION_TYPES, 'receiptPrinter.connection');
  if (input.identifier !== undefined) out.identifier = input.identifier ? String(input.identifier) : null;
  if (input.charWidth !== undefined) out.charWidth = pickNumber(input.charWidth, 'receiptPrinter.charWidth', { min: 16, max: 96 });
  if (input.enabled !== undefined) out.enabled = pickBool(input.enabled);
  return out;
}

function cleanScannerSection(input) {
  if (!input || typeof input !== 'object') return undefined;
  const out = {};
  if (input.mode !== undefined) out.mode = pickEnum(input.mode, SCANNER_MODES, 'scanner.mode');
  if (input.identifier !== undefined) out.identifier = input.identifier ? String(input.identifier) : null;
  if (input.suffix !== undefined) out.suffix = pickEnum(input.suffix, SCANNER_SUFFIX, 'scanner.suffix');
  if (input.minLength !== undefined) out.minLength = pickNumber(input.minLength, 'scanner.minLength', { min: 1, max: 64 });
  if (input.maxInterKeyMs !== undefined) out.maxInterKeyMs = pickNumber(input.maxInterKeyMs, 'scanner.maxInterKeyMs', { min: 10, max: 500 });
  return out;
}

function cleanDrawerSection(input) {
  if (!input || typeof input !== 'object') return undefined;
  const out = {};
  if (input.mode !== undefined) out.mode = pickEnum(input.mode, DRAWER_MODES, 'cashDrawer.mode');
  if (input.kickCommand !== undefined) out.kickCommand = pickEnum(input.kickCommand, DRAWER_KICKS, 'cashDrawer.kickCommand');
  if (input.identifier !== undefined) out.identifier = input.identifier ? String(input.identifier) : null;
  return out;
}

function mergeNested(existing, patch) {
  if (!patch) return existing;
  return { ...(existing || {}), ...patch };
}

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
  const { deviceId, clientType, deviceLabel } = req.body;

  if (!deviceId || !clientType) {
    throw ApiError.badRequest('MISSING_FIELDS', 'deviceId and clientType required');
  }
  if (!CLIENT_TYPES.includes(clientType)) {
    throw ApiError.badRequest('INVALID_CLIENT', `clientType must be one of: ${CLIENT_TYPES.join(', ')}`);
  }

  const existing = await TenantPrinterConfig.findOne({
    tenantId: req.tenantId,
    deviceId,
  }).lean();

  const receiptPrinter = cleanPrinterSection(req.body.receiptPrinter);
  const labelPrinter = cleanPrinterSection(req.body.labelPrinter);
  const scanner = cleanScannerSection(req.body.scanner);
  const cashDrawer = cleanDrawerSection(req.body.cashDrawer);

  const update = {
    deviceId,
    clientType,
    deviceLabel: deviceLabel !== undefined ? (deviceLabel || null) : undefined,
    driverMode: pickEnum(req.body.driverMode, DRIVER_MODES, 'driverMode'),
    receiptPrinter: receiptPrinter ? mergeNested(existing?.receiptPrinter, receiptPrinter) : undefined,
    labelPrinter: labelPrinter ? mergeNested(existing?.labelPrinter, labelPrinter) : undefined,
    scanner: scanner ? mergeNested(existing?.scanner, scanner) : undefined,
    cashDrawer: cashDrawer ? mergeNested(existing?.cashDrawer, cashDrawer) : undefined,
    relayUrl: req.body.relayUrl !== undefined ? (req.body.relayUrl || null) : undefined,
    autoPrintOnSale: pickBool(req.body.autoPrintOnSale),
    copies: req.body.copies !== undefined ? pickNumber(req.body.copies, 'copies', { min: 1, max: 5 }) : undefined,
    openCashDrawerOnSale: pickBool(req.body.openCashDrawerOnSale),
  };

  Object.keys(update).forEach((k) => {
    if (update[k] === undefined) delete update[k];
  });

  const doc = await TenantPrinterConfig.findOneAndUpdate(
    { tenantId: req.tenantId, deviceId },
    { $set: update, $setOnInsert: { tenantId: req.tenantId } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();

  return ok(res, doc);
});

const listDevices = asyncHandler(async (req, res) => {
  const items = await TenantPrinterConfig.find(tenantFilter(req))
    .sort({ updatedAt: -1 })
    .lean();

  return ok(res, { data: items });
});

const deleteDevice = asyncHandler(async (req, res) => {
  const deviceId = req.params.deviceId;
  if (!deviceId) {
    throw ApiError.badRequest('DEVICE_ID_REQUIRED', 'deviceId required');
  }

  const result = await TenantPrinterConfig.deleteOne({
    tenantId: req.tenantId,
    deviceId,
  });

  if (!result.deletedCount) {
    throw ApiError.notFound('DEVICE_NOT_FOUND', 'Device not found');
  }

  return noContent(res);
});

const createPrintLog = asyncHandler(async (req, res) => {
  const {
    clientType,
    docType,
    docId,
    docNumber,
    printerName,
    success,
    error,
    durationMs,
    deviceId,
  } = req.body;

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
  listDevices,
  deleteDevice,
  createPrintLog,
  listPrintLogs,
};