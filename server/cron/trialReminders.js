// cron/trialReminders.js
const cron = require("node-cron");
const License = require("../models/public/License");
const Client = require("../models/admin/Client");
const emailService = require("../services/public/emailService");
const logger = require("../config/logger");

// Run daily at 9:00 AM
const startTrialReminderCron = () => {
  cron.schedule("0 9 * * *", async () => {
    logger.info("🕐 Running trial reminder check...");
    
    try {
      const today = new Date();
      
      // Find all active trial licenses with expiry date
      const licenses = await License.find({ 
        plan: "trial", 
        status: "active",
        expiresAt: { $exists: true, $ne: null }
      }).populate("clientId");
      
      let reminder5Count = 0;
      let reminder1Count = 0;
      let expiredCount = 0;
      
      for (const license of licenses) {
        const client = license.clientId;
        if (!client || !client.email) continue;
        
        const expiresAt = new Date(license.expiresAt);
        const daysLeft = Math.ceil((expiresAt - today) / (1000 * 60 * 60 * 24));
        
        // 5 days remaining
        if (daysLeft === 5 && !license.reminder5Sent) {
          await emailService.sendTrialReminder5Days(client.email, client.businessName, daysLeft);
          license.reminder5Sent = true;
          await license.save();
          reminder5Count++;
          logger.info(`📧 5-day reminder sent to ${client.email}`);
        }
        
        // 1 day remaining
        if (daysLeft === 1 && !license.reminder1Sent) {
          await emailService.sendTrialReminder1Day(client.email, client.businessName, daysLeft);
          license.reminder1Sent = true;
          await license.save();
          reminder1Count++;
          logger.info(`📧 1-day reminder sent to ${client.email}`);
        }
        
        // Expired
        if (daysLeft <= 0 && license.status === "active") {
          license.status = "expired";
          await license.save();
          await emailService.sendTrialExpired(client.email, client.businessName);
          expiredCount++;
          logger.info(`⚠️ Trial expired for ${client.email}`);
          
          // Also update client status
          client.status = "expired";
          await client.save();
        }
      }
      
      logger.info(`✅ Trial reminder check complete: ${reminder5Count} 5-day, ${reminder1Count} 1-day, ${expiredCount} expired`);
      
    } catch (err) {
      logger.error("❌ Trial reminder cron failed", { error: err.message });
    }
  });
  
  logger.info("📧 Trial reminder cron scheduled (runs daily at 9:00 AM)");
};

module.exports = { startTrialReminderCron };