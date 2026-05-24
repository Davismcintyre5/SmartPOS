const catchAsync = require("../../utils/catchAsync");
const { success } = require("../../utils/apiResponse");
const Communication = require("../../models/admin/Communication");

// @desc    Get communication templates
// @route   GET /api/admin/communication
// @access  Private (Admin)
const getTemplates = catchAsync(async (req, res) => {
  let templates = await Communication.findOne().lean();
  if (!templates) templates = await Communication.create({});
  success(res, { templates });
});

// @desc    Update communication templates
// @route   PUT /api/admin/communication
// @access  Private (Admin)
const updateTemplates = catchAsync(async (req, res) => {
  const templates = await Communication.findOneAndUpdate({}, req.body, { upsert: true, new: true });
  success(res, { templates }, "Templates updated");
});

module.exports = { getTemplates, updateTemplates };