// controllers/client/aiController.js

const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/AppError");
const { success } = require("../../utils/apiResponse");
const AISettings = require("../../models/client/AISettings");
const AIConfig = require("../../models/admin/AIConfig");
const aiService = require("../../services/client/aiService");

// @desc    Chat with AI
// @route   POST /api/client/ai/chat
// @access  Private (Client)
const chat = catchAsync(async (req, res) => {
  const { message } = req.body;
  if (!message) throw new AppError("Message required", 400);
  const reply = await aiService.chat(req.clientId, message, req.user.id);
  success(res, { reply });
});

// @desc    Execute NLP command
// @route   POST /api/client/ai/command
// @access  Private (Client)
const command = catchAsync(async (req, res) => {
  const { command: cmd } = req.body;
  if (!cmd) throw new AppError("Command required", 400);
  const result = await aiService.executeCommand(req.clientId, cmd);
  success(res, result);
});

// @desc    Get AI settings
// @route   GET /api/client/ai/settings
// @access  Private (Client)
const getSettings = catchAsync(async (req, res) => {
  let settings = await AISettings.findOne({ clientId: req.clientId }).lean();
  if (!settings) settings = { useGlobalAI: true };

  const globalConfig = await AIConfig.findOne().lean();

  success(res, {
    ...settings,
    outwardKeyEnabled: globalConfig?.outwardKeyEnabled !== false,
    clientEnabled: globalConfig?.clientEnabled !== false,
  });
});

// @desc    Update AI settings
// @route   PUT /api/client/ai/settings
// @access  Private (Client)
const updateSettings = catchAsync(async (req, res) => {
  const globalConfig = await AIConfig.findOne().lean();
  const updates = { ...req.body };

  if (globalConfig?.outwardKeyEnabled === false) {
    updates.useGlobalAI = true;
    updates.apiKey = "";
  }

  const settings = await AISettings.findOneAndUpdate(
    { clientId: req.clientId },
    updates,
    { upsert: true, new: true, runValidators: true }
  );
  success(res, { ...settings.toObject(), outwardKeyEnabled: globalConfig?.outwardKeyEnabled !== false });
});

module.exports = { chat, command, getSettings, updateSettings };