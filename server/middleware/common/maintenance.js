// middleware/common/maintenance.js
const System = require("../../models/admin/System");
const User = require("../../models/client/User");
const emailService = require("../../services/public/emailService");
const logger = require("../../config/logger");

let maintenanceNotificationSent = false;

const maintenance = async (req, res, next) => {
  try {
    const settings = await System.findOne().lean();
    
    if (settings && settings.maintenanceMode) {
      if (!maintenanceNotificationSent && settings.maintenanceNotified !== true) {
        try {
          const users = await User.find({ active: true }).populate("clientId", "businessName");
          const uniqueEmails = new Map();
          users.forEach(user => {
            if (!uniqueEmails.has(user.email)) {
              uniqueEmails.set(user.email, {
                email: user.email,
                name: user.name,
                businessName: user.clientId?.businessName || "SmartPOS User"
              });
            }
          });
          
          for (const [, userInfo] of uniqueEmails) {
            try {
              if (emailService.sendMaintenanceNotification) {
                await emailService.sendMaintenanceNotification(
                  userInfo.email,
                  userInfo.name,
                  userInfo.businessName,
                  settings.maintenanceStartTime || new Date(),
                  settings.maintenanceEndTime || new Date(Date.now() + 2 * 60 * 60 * 1000),
                  settings.maintenanceReason || "scheduled maintenance"
                );
              }
            } catch (emailErr) {
              logger.error(`Failed to send maintenance email to ${userInfo.email}`);
            }
          }
          
          maintenanceNotificationSent = true;
          await System.updateOne({}, { maintenanceNotified: true });
        } catch (err) {
          logger.error("Failed to send maintenance notifications");
        }
      }
      
      return res.status(503).json({
        success: false,
        message: settings.maintenanceMessage || "System is currently under maintenance. Please check back later.",
        maintenance: {
          status: "active",
          startTime: settings.maintenanceStartTime,
          estimatedEndTime: settings.maintenanceEndTime,
          reason: settings.maintenanceReason || "System maintenance"
        }
      });
    }
    
    if (maintenanceNotificationSent) {
      maintenanceNotificationSent = false;
      await System.updateOne({}, { maintenanceNotified: false });
    }
    
    next();
  } catch (err) {
    logger.error("Maintenance middleware error", { error: err.message });
    next();
  }
};

const sendMaintenanceNotificationToAll = async () => {
  try {
    const settings = await System.findOne().lean();
    if (!settings || !settings.maintenanceMode) {
      return { success: false, message: "Maintenance mode not active" };
    }
    
    const users = await User.find({ active: true }).populate("clientId", "businessName");
    const uniqueEmails = new Map();
    users.forEach(user => {
      if (!uniqueEmails.has(user.email)) {
        uniqueEmails.set(user.email, {
          email: user.email,
          name: user.name,
          businessName: user.clientId?.businessName || "SmartPOS User"
        });
      }
    });
    
    let sentCount = 0;
    for (const [, userInfo] of uniqueEmails) {
      try {
        if (emailService.sendMaintenanceNotification) {
          await emailService.sendMaintenanceNotification(
            userInfo.email,
            userInfo.name,
            userInfo.businessName,
            settings.maintenanceStartTime || new Date(),
            settings.maintenanceEndTime || new Date(Date.now() + 2 * 60 * 60 * 1000),
            settings.maintenanceReason || "scheduled maintenance"
          );
          sentCount++;
        }
      } catch (emailErr) {
        logger.error(`Failed to send maintenance email to ${userInfo.email}`);
      }
    }
    
    return { success: true, sentCount };
  } catch (err) {
    logger.error("Failed to send maintenance notifications", { error: err.message });
    return { success: false, error: err.message };
  }
};

const sendMaintenanceCompletedNotification = async () => {
  try {
    const settings = await System.findOne().lean();
    const users = await User.find({ active: true }).populate("clientId", "businessName");
    const uniqueEmails = new Map();
    users.forEach(user => {
      if (!uniqueEmails.has(user.email)) {
        uniqueEmails.set(user.email, {
          email: user.email,
          name: user.name,
          businessName: user.clientId?.businessName || "SmartPOS User"
        });
      }
    });
    
    let sentCount = 0;
    for (const [, userInfo] of uniqueEmails) {
      try {
        if (emailService.sendMaintenanceCompleted) {
          await emailService.sendMaintenanceCompleted(userInfo.email, userInfo.name, userInfo.businessName);
          sentCount++;
        }
      } catch (emailErr) {
        logger.error(`Failed to send maintenance completed email to ${userInfo.email}`);
      }
    }
    
    return { success: true, sentCount };
  } catch (err) {
    logger.error("Failed to send maintenance completed notifications", { error: err.message });
    return { success: false, error: err.message };
  }
};

// Export as function directly (for router.use)
module.exports = maintenance;
module.exports.sendMaintenanceNotificationToAll = sendMaintenanceNotificationToAll;
module.exports.sendMaintenanceCompletedNotification = sendMaintenanceCompletedNotification;