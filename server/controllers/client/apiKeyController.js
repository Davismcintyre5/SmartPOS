const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/AppError");
const { success } = require("../../utils/apiResponse");
const ApiKey = require("../../models/client/ApiKey");

// @desc    Generate API key
// @route   POST /api/client/api-keys/generate
// @access  Private (Client)
const generateApiKey = catchAsync(async (req, res) => {
  const { name } = req.body;
  if (!name) throw new AppError("Key name is required", 400);

  const apiKey = await ApiKey.create({ clientId: req.clientId, name });
  success(res, { key: apiKey.key, maskedKey: apiKey.maskedKey, name: apiKey.name }, "API key generated", 201);
});

// @desc    Get all API keys
// @route   GET /api/client/api-keys
// @access  Private (Client)
const getApiKeys = catchAsync(async (req, res) => {
  const keys = await ApiKey.find({ clientId: req.clientId, active: true })
    .select("name maskedKey lastUsed createdAt")
    .lean();
  success(res, keys);
});

// @desc    Revoke API key
// @route   DELETE /api/client/api-keys/:id
// @access  Private (Client)
const revokeApiKey = catchAsync(async (req, res) => {
  const key = await ApiKey.findOneAndUpdate(
    { _id: req.params.id, clientId: req.clientId, active: true },
    { active: false },
    { new: true }
  );
  if (!key) throw new AppError("API key not found", 404);
  success(res, null, "API key revoked");
});

module.exports = { generateApiKey, getApiKeys, revokeApiKey };