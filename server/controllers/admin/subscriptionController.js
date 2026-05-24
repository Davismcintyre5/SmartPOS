const catchAsync = require("../../utils/catchAsync");
const { success } = require("../../utils/apiResponse");
const subscriptionService = require("../../services/admin/subscriptionService");

// @desc    Get subscription plan
// @route   GET /api/admin/subscription
// @access  Private (Admin)
const getPlan = catchAsync(async (req, res) => {
  const plan = await subscriptionService.getPlan();
  success(res, { plan });
});

// @desc    Update subscription plan
// @route   PUT /api/admin/subscription
// @access  Private (Admin)
const updatePlan = catchAsync(async (req, res) => {
  const plan = await subscriptionService.updatePlan(req.body);
  success(res, { plan }, "Plan updated");
});

module.exports = { getPlan, updatePlan };