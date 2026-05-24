const catchAsync = require("../../utils/catchAsync");
const { success } = require("../../utils/apiResponse");
const Currency = require("../../models/admin/Currency");

// @desc    Get system currency
// @route   GET /api/admin/currency
// @access  Private (Admin)
const getCurrency = catchAsync(async (req, res) => {
  let currency = await Currency.findOne().lean();
  if (!currency) currency = { baseCurrency: "KES" };
  success(res, { currency, available: ["KES", "USD", "EUR", "GBP"] });
});

// @desc    Update system currency
// @route   PUT /api/admin/currency
// @access  Private (Admin)
const updateCurrency = catchAsync(async (req, res) => {
  const currency = await Currency.findOneAndUpdate({}, req.body, { upsert: true, new: true });
  success(res, { currency }, "Currency updated");
});

module.exports = { getCurrency, updateCurrency };