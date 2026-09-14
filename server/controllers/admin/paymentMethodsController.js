const PaymentMethod = require('../../models/admin/PaymentMethod');
const stripeService = require('../../services/stripeService');
const paypalService = require('../../services/paypalService');
const mpesaService = require('../../services/mpesaService');
const { success } = require('../../utils/response');
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');

const list = asyncHandler(async (req, res) => {
  const methods = await PaymentMethod.find({}).sort({ position: 1 }).lean();
  return success(res, methods, 'Payment methods');
});

const getOne = asyncHandler(async (req, res) => {
  const method = await PaymentMethod.findById(req.params.id).lean();
  if (!method) throw ApiError.notFound('Payment method not found');
  return success(res, method, 'Payment method');
});

const update = asyncHandler(async (req, res) => {
  const method = await PaymentMethod.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!method) throw ApiError.notFound('Payment method not found');
  return success(res, method, 'Payment method updated');
});

const toggle = asyncHandler(async (req, res) => {
  const method = await PaymentMethod.findById(req.params.id);
  if (!method) throw ApiError.notFound('Payment method not found');

  method.enabled = !method.enabled;
  await method.save();

  return success(res, method, `Method ${method.enabled ? 'enabled' : 'disabled'}`);
});

const test = asyncHandler(async (req, res) => {
  const method = await PaymentMethod.findById(req.params.id).lean();
  if (!method) throw ApiError.notFound('Payment method not found');

  let status = 'not_configured';

  try {
    if (method._id === 'stripe') {
      await stripeService.getPriceId('starter', 'monthly', 'USD');
      status = 'connected';
    } else if (method._id === 'paypal') {
      await paypalService.getAccessToken();
      status = 'connected';
    } else if (method._id?.startsWith('mpesa')) {
      await mpesaService.getAccessToken();
      status = 'connected';
    }
  } catch (err) {
    status = 'error';
  }

  await PaymentMethod.updateOne({ _id: method._id }, { status });

  return success(res, { status }, `Connection test: ${status}`);
});

module.exports = { list, getOne, update, toggle, test };