const catchAsync = require("../../utils/catchAsync");
const { success } = require("../../utils/apiResponse");
const backupService = require("../../services/admin/systemBackupService");

// @desc    Get all system backups
// @route   GET /api/admin/system-backups
// @access  Private (Admin)
const getBackups = catchAsync(async (req, res) => {
  const backups = await backupService.getBackups();
  success(res, { backups });
});

// @desc    Create system backup
// @route   POST /api/admin/system-backups
// @access  Private (Superadmin)
const createBackup = catchAsync(async (req, res) => {
  const backup = await backupService.createSystemBackup(req.body.scope, req.admin._id);
  success(res, { backup }, "Backup created", 201);
});

// @desc    Download system backup
// @route   GET /api/admin/system-backups/:id/download
// @access  Private (Admin)
const downloadBackup = catchAsync(async (req, res) => {
  const backup = await backupService.getBackupById(req.params.id);
  res.download(backup.path);
});

// @desc    Delete system backup
// @route   DELETE /api/admin/system-backups/:id
// @access  Private (Superadmin)
const deleteBackup = catchAsync(async (req, res) => {
  await backupService.deleteBackup(req.params.id);
  success(res, null, "Backup deleted");
});

module.exports = { getBackups, createBackup, downloadBackup, deleteBackup };