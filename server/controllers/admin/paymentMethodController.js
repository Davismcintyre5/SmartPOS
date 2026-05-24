const catchAsync = require("../../utils/catchAsync");
const { success } = require("../../utils/apiResponse");
const PaymentMethod = require("../../models/admin/PaymentMethod");

// @desc    Get payment methods
// @route   GET /api/admin/payment-methods
// @access  Private (Admin)
const getMethods = catchAsync(async (req, res) => {
  let methods = await PaymentMethod.findOne().lean();
  if (!methods) methods = await PaymentMethod.create({});
  success(res, { methods });
});

// @desc    Update payment methods
// @route   PUT /api/admin/payment-methods
// @access  Private (Admin)
const updateMethods = catchAsync(async (req, res) => {
  const methods = await PaymentMethod.findOneAndUpdate({}, req.body, { upsert: true, new: true });
  success(res, { methods }, "Payment methods updated");
});

module.exports = { getMethods, updateMethods };