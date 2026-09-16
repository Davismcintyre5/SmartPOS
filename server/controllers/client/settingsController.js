const Client = require('../../models/admin/Client');
const Settings = require('../../models/client/Settings');
const cloudinaryService = require('../../services/cloudinaryService');
const { success } = require('../../utils/response');
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');

const get = asyncHandler(async (req, res) => {
  const settings = await Settings.findOne({ tenantId: req.tenant._id }).lean();
  return success(res, settings || {}, 'Settings');
});

const update = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne({ tenantId: req.tenant._id });

  if (!settings) {
    settings = await Settings.create({
      tenantId: req.tenant._id,
      currency: req.tenant.storeCurrency,
      ...req.body
    });
  } else {
    Object.assign(settings, req.body);
    await settings.save();
  }

  return success(res, settings, 'Settings updated');
});

const uploadLogo = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('No file uploaded');

  const client = await Client.findById(req.tenant._id);
  if (!client) throw ApiError.notFound('Client not found');

  const result = await cloudinaryService.uploadLogo(req.file.buffer, req.tenant._id.toString());

  client.logoUrl = result.url;
  await client.save();

  return success(res, { logoUrl: result.url }, 'Logo uploaded');
});

const updateReceipt = asyncHandler(async (req, res) => {
  const { receiptHeader, receiptFooter, receiptShowLogo, receiptShowTax, autoPrintReceipt } = req.body;

  let settings = await Settings.findOne({ tenantId: req.tenant._id });
  if (!settings) settings = new Settings({ tenantId: req.tenant._id, currency: req.tenant.storeCurrency });

  if (receiptHeader !== undefined) settings.receiptHeader = receiptHeader;
  if (receiptFooter !== undefined) settings.receiptFooter = receiptFooter;
  if (receiptShowLogo !== undefined) settings.receiptShowLogo = receiptShowLogo;
  if (receiptShowTax !== undefined) settings.receiptShowTax = receiptShowTax;
  if (autoPrintReceipt !== undefined) settings.autoPrintReceipt = autoPrintReceipt;

  await settings.save();
  return success(res, settings, 'Receipt updated');
});

const updateTax = asyncHandler(async (req, res) => {
  const { taxRate, taxLabel, taxInclusive } = req.body;

  let settings = await Settings.findOne({ tenantId: req.tenant._id });
  if (!settings) settings = new Settings({ tenantId: req.tenant._id, currency: req.tenant.storeCurrency });

  if (taxRate !== undefined) settings.taxRate = taxRate;
  if (taxLabel !== undefined) settings.taxLabel = taxLabel;
  if (taxInclusive !== undefined) settings.taxInclusive = taxInclusive;

  await settings.save();
  return success(res, settings, 'Tax updated');
});

module.exports = { get, update, uploadLogo, updateReceipt, updateTax };