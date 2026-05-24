const catchAsync = require("../../utils/catchAsync");
const { success } = require("../../utils/apiResponse");
const backupService = require("../../services/client/backupService");

// @desc    Create backup
// @route   POST /api/client/backups
// @access  Private (Client)
const createBackup = catchAsync(async (req, res) => {
  const backup = await backupService.createBackup(req.clientId, req.body.type);
  success(res, backup, "Backup created", 201);
});

// @desc    Get backups
// @route   GET /api/client/backups
// @access  Private (Client)
const getBackups = catchAsync(async (req, res) => {
  const backups = await backupService.getBackups(req.clientId);
  success(res, backups);
});

module.exports = { createBackup, getBackups };