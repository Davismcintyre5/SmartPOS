// controllers/client/subscriptionController.js
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/AppError");
const { success } = require("../../utils/apiResponse");
const Client = require("../../models/admin/Client");
const Payment = require("../../models/admin/Payment");

// @desc    Get client subscription
// @route   GET /api/client/subscription
// @access  Private (Client)
const getSubscription = catchAsync(async (req, res) => {
  const client = await Client.findById(req.clientId).lean();
  if (!client) throw new AppError("Client not found", 404);

  success(res, {
    plan: client.plan || "N/A",
    status: client.status || "N/A",
    startDate: client.createdAt,
    expiryDate: client.subscriptionExpiry,
  });
});

// @desc    Get payment history
// @route   GET /api/client/subscription/payments
// @access  Private (Client)
const getPaymentHistory = catchAsync(async (req, res) => {
  const payments = await Payment.find({ client: req.clientId })
    .sort("-createdAt")
    .select("amount method billingCycle status createdAt")
    .lean();
  success(res, payments);
});

module.exports = { getSubscription, getPaymentHistory };