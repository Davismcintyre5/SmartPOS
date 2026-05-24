const catchAsync = require("../../utils/catchAsync");
const { success } = require("../../utils/apiResponse");
const currencyService = require("../../services/client/currencyService");

// @desc    Get client currency
// @route   GET /api/client/currency
// @access  Private (Client)
const getCurrency = catchAsync(async (req, res) => {
  const data = await currencyService.getClientCurrency(req.clientId);
  success(res, data);
});

// @desc    Update client currency
// @route   PUT /api/client/currency
// @access  Private (Client)
const updateCurrency = catchAsync(async (req, res) => {
  const setting = await currencyService.updateClientCurrency(req.clientId, req.body.currency);
  success(res, setting, "Currency updated");
});

module.exports = { getCurrency, updateCurrency };