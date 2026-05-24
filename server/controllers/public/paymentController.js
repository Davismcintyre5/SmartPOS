// controllers/public/paymentController.js
const catchAsync = require("../../utils/catchAsync");
const { success } = require("../../utils/apiResponse");
const paymentService = require("../../services/public/paymentService");
const stripe = require("../../utils/stripeHelper");
const paypal = require("../../utils/paypalHelper");
const Payment = require("../../models/admin/Payment");

// @desc    Initiate payment
// @route   POST /api/public/payments/initiate
// @access  Public
const initiatePayment = catchAsync(async (req, res) => {
  const result = await paymentService.initiatePayment(req.body);
  success(res, result, "Payment initiated", 201);
});

// @desc    Create Stripe payment intent
// @route   POST /api/public/payments/create-intent
// @access  Public
const createPaymentIntent = catchAsync(async (req, res) => {
  const result = await stripe.createPaymentIntent(req.body.amount, req.body.currency, req.body.metadata);
  success(res, result);
});

// @desc    Create PayPal order
// @route   POST /api/public/payments/create-order
// @access  Public
const createPayPalOrder = catchAsync(async (req, res) => {
  const result = await paypal.createOrder(req.body.amount, req.body.currency);
  success(res, result);
});

// @desc    M-Pesa callback
// @route   POST /api/public/payments/mpesa/callback
// @access  Public
const mpesaCallback = catchAsync(async (req, res) => {
  await paymentService.handleMpesaCallback(req.body);
  success(res, null, "Callback received");
});

// @desc    Get payment status
// @route   GET /api/public/payments/:id/status
// @access  Public
const getPaymentStatus = catchAsync(async (req, res) => {
  const payment = await Payment.findById(req.params.id).select("status amount method").lean();
  success(res, { payment });
});

module.exports = { initiatePayment, createPaymentIntent, createPayPalOrder, mpesaCallback, getPaymentStatus };