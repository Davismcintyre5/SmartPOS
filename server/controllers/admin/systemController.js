// controllers/admin/systemController.js
const catchAsync = require("../../utils/catchAsync");
const { success } = require("../../utils/apiResponse");
const System = require("../../models/admin/System");
const { sendMaintenanceNotificationToAll, sendMaintenanceCompletedNotification } = require("../../middleware/common/maintenance");
const logger = require("../../config/logger");

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

// @desc    Enable maintenance mode with email notifications
// @route   POST /api/admin/system/maintenance/enable
// @access  Private (Admin)
const enableMaintenance = catchAsync(async (req, res) => {
  const { reason, estimatedDuration, message, durationHours = 2 } = req.body;
  
  const maintenanceEndTime = new Date(Date.now() + durationHours * 60 * 60 * 1000);
  
  const settings = await System.findOneAndUpdate(
    {},
    {
      maintenanceMode: true,
      maintenanceReason: reason || "Scheduled maintenance",
      maintenanceStartTime: new Date(),
      maintenanceEndTime: maintenanceEndTime,
      estimatedDuration: estimatedDuration || `${durationHours} hours`,
      maintenanceMessage: message || "System is currently under maintenance. Please check back later.",
      maintenanceNotified: false
    },
    { upsert: true, new: true }
  );
  
  // Send email notifications to all users
  const notificationResult = await sendMaintenanceNotificationToAll();
  
  logger.info(`Maintenance mode enabled. Notifications sent to ${notificationResult.sentCount || 0} users`);
  
  success(res, { 
    settings, 
    notificationsSent: notificationResult.sentCount || 0 
  }, "Maintenance mode enabled and notifications sent");
});

// @desc    Disable maintenance mode
// @route   POST /api/admin/system/maintenance/disable
// @access  Private (Admin)
const disableMaintenance = catchAsync(async (req, res) => {
  const { sendCompletionEmail = true } = req.body;
  
  // Send completion email if requested
  if (sendCompletionEmail) {
    const completionResult = await sendMaintenanceCompletedNotification();
    logger.info(`Maintenance completion notifications sent to ${completionResult.sentCount || 0} users`);
  }
  
  const settings = await System.findOneAndUpdate(
    {},
    {
      maintenanceMode: false,
      maintenanceNotified: false,
      maintenanceEndTime: null
    },
    { upsert: true, new: true }
  );
  
  success(res, { settings }, "Maintenance mode disabled");
});

// @desc    Get maintenance status
// @route   GET /api/admin/system/maintenance/status
// @access  Private (Admin)
const getMaintenanceStatus = catchAsync(async (req, res) => {
  const settings = await System.findOne().lean();
  
  if (!settings) {
    return success(res, { maintenanceMode: false });
  }
  
  success(res, {
    maintenanceMode: settings.maintenanceMode || false,
    maintenanceMessage: settings.maintenanceMessage,
    maintenanceReason: settings.maintenanceReason,
    maintenanceStartTime: settings.maintenanceStartTime,
    maintenanceEndTime: settings.maintenanceEndTime,
    estimatedDuration: settings.estimatedDuration,
    supportEmail: settings.supportEmail
  });
});

module.exports = { 
  getSettings, 
  updateSettings, 
  enableMaintenance, 
  disableMaintenance, 
  getMaintenanceStatus 
};