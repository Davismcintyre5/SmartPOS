const catchAsync = require("../../utils/catchAsync");
const { success } = require("../../utils/apiResponse");
const System = require("../../models/admin/System");

// @desc    Get system settings
// @route   GET /api/admin/system
// @access  Private (Admin)
const getSettings = catchAsync(async (req, res) => {
  let settings = await System.findOne().lean();
  if (!settings) settings = await System.create({});
  success(res, { settings });
});

// @desc    Update system settings
// @route   PUT /api/admin/system
// @access  Private (Admin)
const updateSettings = catchAsync(async (req, res) => {
  const settings = await System.findOneAndUpdate({}, req.body, { upsert: true, new: true });
  success(res, { settings }, "System settings updated");
});

module.exports = { getSettings, updateSettings };