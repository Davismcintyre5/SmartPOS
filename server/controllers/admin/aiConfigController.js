const catchAsync = require("../../utils/catchAsync");
const { success } = require("../../utils/apiResponse");
const aiConfigService = require("../../services/admin/aiConfigService");

// @desc    Get AI configuration
// @route   GET /api/admin/ai-config
// @access  Private (Admin)
const getConfig = catchAsync(async (req, res) => {
  const config = await aiConfigService.getConfig();
  success(res, { config });
});

// @desc    Update AI configuration
// @route   PUT /api/admin/ai-config
// @access  Private (Admin)
const updateConfig = catchAsync(async (req, res) => {
  const config = await aiConfigService.updateConfig(req.body);
  success(res, { config }, "AI configuration updated");
});

module.exports = { getConfig, updateConfig };