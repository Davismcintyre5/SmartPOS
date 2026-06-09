// services/public/emailService.js
const { sendEmail } = require("../../utils/hdmBridgeHelper");
const Communication = require("../../models/admin/Communication");
const logger = require("../../config/logger");

// ============================================================
// TRIAL LICENSE EMAIL
// ============================================================
const sendTrialLicenseEmail = async (to, businessName, licenseKey) => {
  try {
    const comm = await Communication.findOne().lean();
    const activationUrl = `${process.env.CLIENT_URL || 'https://smartpos.pxxl.click'}/activate`;
    
    let html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"><title>Your SmartPOS Trial License</title>
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 500px; margin: 50px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background-color: #2563eb; padding: 30px 20px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; }
        .content { padding: 30px; text-align: center; }
        .license-box { background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 15px; margin: 20px 0; }
        .license-key { font-family: monospace; font-size: 18px; font-weight: bold; color: #2563eb; }
        .button { display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
      </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h1>🎉 Welcome to SmartPOS!</h1></div>
          <div class="content">
            <p>Dear <strong>${businessName}</strong>,</p>
            <div class="license-box">
              <p>Your Trial License Key:</p>
              <p class="license-key">${licenseKey}</p>
              <p>Trial Period: <strong>14 days</strong></p>
            </div>
            <a href="${activationUrl}" class="button">Activate Your License</a>
            <p>Need help? <a href="mailto:support@smartpos.com">support@smartpos.com</a></p>
          </div>
          <div class="footer"><p>SmartPOS - Point of Sale System</p></div>
        </div>
      </body>
      </html>
    `;
    
    await sendEmail({ to, subject: "Your SmartPOS Trial License", htmlContent: html });
    return true;
  } catch (err) {
    logger.error("Failed to send trial license email", { error: err.message, to });
    return false;
  }
};

// ============================================================
// PAYMENT APPROVED EMAIL (with license key and details)
// ============================================================
const sendPaymentApproved = async (to, businessName, licenseKey, plan, expiryDate) => {
  try {
    const activationUrl = `${process.env.CLIENT_URL || 'https://smartpos.pxxl.click'}/activate`;
    const formatExpiryDate = expiryDate ? new Date(expiryDate).toLocaleDateString() : 'N/A';
    const planDisplay = { monthly: 'Monthly', yearly: 'Yearly', permanent: 'Permanent' }[plan] || plan;
    
    let html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"><title>Payment Approved - License Active</title>
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 500px; margin: 50px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background-color: #10b981; padding: 30px 20px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; }
        .content { padding: 30px; text-align: center; }
        .license-box { background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 15px; margin: 20px 0; }
        .license-key { font-family: monospace; font-size: 18px; font-weight: bold; color: #10b981; }
        .info-box { background-color: #f8fafc; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: left; }
        .info-row { display: flex; justify-content: space-between; padding: 5px 0; }
        .button { display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
      </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h1>✅ Payment Approved!</h1></div>
          <div class="content">
            <p>Dear <strong>${businessName}</strong>,</p>
            <div class="license-box">
              <p>Your License Key:</p>
              <p class="license-key">${licenseKey}</p>
            </div>
            <div class="info-box">
              <div class="info-row"><span>📋 Plan:</span><strong>${planDisplay}</strong></div>
              <div class="info-row"><span>📅 Expires:</span><strong>${plan === 'permanent' ? 'Never' : formatExpiryDate}</strong></div>
              <div class="info-row"><span>✅ Status:</span><strong style="color:#10b981;">Active</strong></div>
            </div>
            <a href="${activationUrl}" class="button">Activate Your License</a>
            <p>Need help? <a href="mailto:support@smartpos.com">support@smartpos.com</a></p>
          </div>
          <div class="footer"><p>SmartPOS - Point of Sale System</p></div>
        </div>
      </body>
      </html>
    `;
    
    await sendEmail({ to, subject: `SmartPOS - License Activated (${planDisplay})`, htmlContent: html });
    return true;
  } catch (err) {
    logger.error("Failed to send payment approved email", { error: err.message, to });
    return false;
  }
};

// ============================================================
// PAYMENT REJECTED EMAIL
// ============================================================
const sendPaymentRejected = async (to, businessName, reason) => {
  try {
    const contactUrl = `${process.env.CLIENT_URL || 'https://smartpos.pxxl.click'}/contact`;
    let html = `<h1>Payment Rejected</h1><p>Dear ${businessName},</p><p>Your payment was rejected.</p><p>Reason: ${reason}</p><p><a href="${contactUrl}">Contact Support</a></p>`;
    await sendEmail({ to, subject: "SmartPOS - Payment Rejected", htmlContent: html });
    return true;
  } catch (err) {
    logger.error("Failed to send payment rejected email", { error: err.message, to });
    return false;
  }
};

// ============================================================
// PASSWORD RESET EMAIL
// ============================================================
const sendPasswordResetEmail = async (to, resetToken, userName) => {
  try {
    const resetUrl = `${process.env.CLIENT_URL || 'https://smartpos.pxxl.click'}/reset-password?token=${resetToken}`;
    let html = `<h1>Reset Your Password</h1><p>Hello ${userName || 'User'},</p><p><a href="${resetUrl}" style="background:#2563eb;color:#fff;padding:10px 20px;text-decoration:none;border-radius:5px;">Reset Password</a></p><p>This link expires in 1 hour.</p>`;
    await sendEmail({ to, subject: "SmartPOS - Password Reset Request", htmlContent: html });
    return true;
  } catch (err) {
    logger.error("Failed to send password reset email", { error: err.message, to });
    return false;
  }
};

// ============================================================
// WELCOME EMAIL (After Registration)
// ============================================================
const sendWelcomeEmail = async (to, userName, businessName) => {
  try {
    const loginUrl = `${process.env.CLIENT_URL || 'https://smartpos.pxxl.click'}/login`;
    let html = `<h1>Welcome to SmartPOS!</h1><p>Dear ${businessName},</p><p>Your account has been created.</p><p>Status: Pending Approval</p><p>You will receive your license key once approved.</p><a href="${loginUrl}">Login</a>`;
    await sendEmail({ to, subject: `Welcome to SmartPOS, ${businessName}!`, htmlContent: html });
    return true;
  } catch (err) {
    logger.error("Failed to send welcome email", { error: err.message, to });
    return false;
  }
};

// ============================================================
// USER APPROVED WITH LICENSE EMAIL (Complete - Key, Plan, Expiry, Support)
// ============================================================
const sendUserApprovedWithLicenseEmail = async (to, userName, businessName, licenseKey, plan, expiryDate) => {
  try {
    const loginUrl = `${process.env.CLIENT_URL || 'https://smartpos.pxxl.click'}/login`;
    const activationUrl = `${process.env.CLIENT_URL || 'https://smartpos.pxxl.click'}/activate`;
    const supportEmail = "support@smartpos.com";
    const supportPhone = "+254768784909";
    
    const formatExpiryDate = expiryDate ? new Date(expiryDate).toLocaleDateString() : 'N/A';
    const planDisplay = { monthly: 'Monthly Subscription', yearly: 'Yearly Subscription', permanent: 'Permanent License' }[plan] || plan;
    
    let html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"><title>Account Approved - License Activated</title>
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 550px; margin: 50px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background-color: #10b981; padding: 30px 20px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; }
        .content { padding: 30px; }
        .license-box { background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center; }
        .license-key { font-family: monospace; font-size: 20px; font-weight: bold; color: #10b981; }
        .info-box { background-color: #f8fafc; border-radius: 8px; padding: 15px; margin: 20px 0; }
        .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
        .button { display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 12px 25px; border-radius: 5px; font-weight: bold; margin: 10px 5px; }
        .button-secondary { background-color: #2563eb; }
        .support-box { background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center; }
        .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
        hr { margin: 20px 0; }
      </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h1>✅ Account Approved & License Activated!</h1></div>
          <div class="content">
            <p>Dear <strong>${userName}</strong>,</p>
            <p>Your SmartPOS account for <strong>${businessName}</strong> has been <strong>approved</strong> and your license is now <strong>ACTIVE</strong>.</p>
            
            <div class="license-box">
              <p>🔑 Your License Key:</p>
              <p class="license-key">${licenseKey}</p>
              <p style="font-size:12px;">Save this key. You'll need it for activation.</p>
            </div>
            
            <div class="info-box">
              <div class="info-row"><span>📋 Plan:</span><strong>${planDisplay}</strong></div>
              <div class="info-row"><span>📅 Expires:</span><strong>${plan === 'permanent' ? 'Never (Permanent)' : formatExpiryDate}</strong></div>
              <div class="info-row"><span>✅ Status:</span><strong style="color:#10b981;">Active</strong></div>
            </div>
            
            <div style="text-align:center;">
              <a href="${activationUrl}" class="button">🚀 Activate License</a>
              <a href="${loginUrl}" class="button button-secondary">📱 Login to Dashboard</a>
            </div>
            
            <hr />
            
            <div class="support-box">
              <p><strong>📞 Need Help?</strong></p>
              <p>📧 <a href="mailto:${supportEmail}">${supportEmail}</a> | 📞 <a href="tel:${supportPhone}">${supportPhone}</a></p>
              <p>⏰ Monday - Friday, 8 AM - 6 PM EAT</p>
            </div>
            
            <hr />
            
            <p style="font-size:12px; text-align:center;">
              <a href="https://docs.smartpos.com">Documentation</a> | 
              <a href="https://smartpos.pxxl.click/help">Help Center</a> | 
              <a href="https://smartpos.pxxl.click/faqs">FAQs</a>
            </p>
          </div>
          <div class="footer"><p>SmartPOS - Point of Sale System © ${new Date().getFullYear()}</p></div>
        </div>
      </body>
      </html>
    `;
    
    await sendEmail({ to, subject: `SmartPOS - License Activated (${planDisplay})`, htmlContent: html });
    return true;
  } catch (err) {
    logger.error("Failed to send user approved with license email", { error: err.message, to });
    return false;
  }
};

// ============================================================
// RECEIPT EMAIL
// ============================================================
const sendReceiptEmail = async (to, customerName, saleData) => {
  try {
    let itemsHtml = '';
    saleData.items.forEach(item => {
      itemsHtml += `<tr><td>${item.name}</td><td>${item.quantity}</td><td>${item.price}</td><td>${item.price * item.quantity}</td></tr>`;
    });
    let html = `<h2>Thank you for your purchase!</h2><p>Receipt #${saleData.receiptNumber}</p><table border="1">${itemsHtml}</table><p><strong>Total: ${saleData.total}</strong></p><p>Payment: ${saleData.paymentMethod}</p>`;
    await sendEmail({ to, subject: `Receipt #${saleData.receiptNumber} - SmartPOS`, htmlContent: html });
    return true;
  } catch (err) {
    logger.error("Failed to send receipt email", { error: err.message, to });
    return false;
  }
};

// ============================================================
// TRIAL REMINDER EMAILS
// ============================================================
const sendTrialReminder5Days = async (to, businessName, daysLeft) => {
  const upgradeUrl = `${process.env.CLIENT_URL || 'https://smartpos.pxxl.click'}/pricing`;
  let html = `<h1>Your Trial Ends in ${daysLeft} Days</h1><p>Dear ${businessName},</p><p>Your trial expires in ${daysLeft} days.</p><a href="${upgradeUrl}">Upgrade Now</a>`;
  await sendEmail({ to, subject: `SmartPOS Trial: ${daysLeft} Days Remaining`, htmlContent: html });
  return true;
};

const sendTrialReminder1Day = async (to, businessName, daysLeft) => {
  const upgradeUrl = `${process.env.CLIENT_URL || 'https://smartpos.pxxl.click'}/pricing`;
  let html = `<h1>Your Trial Ends Tomorrow!</h1><p>Dear ${businessName},</p><p>Your trial expires tomorrow.</p><a href="${upgradeUrl}">Upgrade Now</a>`;
  await sendEmail({ to, subject: "SmartPOS Trial: Last Day Remaining", htmlContent: html });
  return true;
};

const sendTrialExpired = async (to, businessName) => {
  const pricingUrl = `${process.env.CLIENT_URL || 'https://smartpos.pxxl.click'}/pricing`;
  let html = `<h1>Your Trial Has Expired</h1><p>Dear ${businessName},</p><p>Your SmartPOS trial has expired.</p><a href="${pricingUrl}">View Plans</a>`;
  await sendEmail({ to, subject: "SmartPOS Trial Has Expired", htmlContent: html });
  return true;
};

// Add to services/public/emailService.js

const sendMaintenanceNotification = async (to, userName, businessName, startTime, endTime, reason) => {
  try {
    const formatDate = (date) => {
      return new Date(date).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      });
    };
    
    const loginUrl = `${process.env.CLIENT_URL || 'https://smartpos.pxxl.click'}/login`;
    
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>System Maintenance Notification</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 500px; margin: 50px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background-color: #d97706; padding: 30px 20px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; }
          .content { padding: 30px; }
          .info-box { background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 15px; margin: 20px 0; }
          .info-row { padding: 5px 0; }
          .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔧 System Maintenance Notice</h1>
          </div>
          <div class="content">
            <p>Dear <strong>${userName || businessName}</strong>,</p>
            <p>SmartPOS will be undergoing scheduled maintenance.</p>
            
            <div class="info-box">
              <div class="info-row"><strong>📅 Start Time:</strong> ${formatDate(startTime)}</div>
              <div class="info-row"><strong>⏰ Estimated Duration:</strong> 2-3 hours</div>
              <div class="info-row"><strong>📋 Reason:</strong> ${reason}</div>
              <div class="info-row"><strong>✅ Action Required:</strong> None</div>
            </div>
            
            <p>During this time, the system may be temporarily unavailable. We apologize for any inconvenience.</p>
            <p>Once maintenance is complete, SmartPOS will resume normal operation.</p>
            
            <p style="font-size: 12px; color: #64748b; margin-top: 20px;">
              Questions? Contact us at <a href="mailto:support@smartpos.com">support@smartpos.com</a>
            </p>
          </div>
          <div class="footer">
            <p>SmartPOS - Point of Sale System</p>
            <p>© ${new Date().getFullYear()} SmartPOS. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    await sendEmail({ to, subject: "SmartPOS - Scheduled Maintenance Notice", htmlContent: html });
    return true;
  } catch (err) {
    logger.error("Failed to send maintenance notification", { error: err.message, to });
    return false;
  }
};

const sendMaintenanceCompleted = async (to, userName, businessName) => {
  try {
    const loginUrl = `${process.env.CLIENT_URL || 'https://smartpos.pxxl.click'}/login`;
    
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Maintenance Complete</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 500px; margin: 50px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background-color: #10b981; padding: 30px 20px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; }
          .content { padding: 30px; text-align: center; }
          .button { display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Maintenance Complete</h1>
          </div>
          <div class="content">
            <p>Dear <strong>${userName || businessName}</strong>,</p>
            <p>The scheduled maintenance has been <strong>completed successfully</strong>.</p>
            <p>SmartPOS is now back online and fully operational.</p>
            <a href="${loginUrl}" class="button">Login to SmartPOS</a>
            <p style="font-size: 12px; color: #64748b; margin-top: 20px;">
              Thank you for your patience.
            </p>
          </div>
          <div class="footer">
            <p>SmartPOS - Point of Sale System</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    await sendEmail({ to, subject: "SmartPOS - Maintenance Complete", htmlContent: html });
    return true;
  } catch (err) {
    logger.error("Failed to send maintenance completed email", { error: err.message, to });
    return false;
  }
};

// Add to services/public/emailService.js

const sendCustomEmail = async ({ to, toName, subject, htmlContent }) => {
  try {
    await sendEmail({
      to,
      subject,
      htmlContent,
      textContent: htmlContent.replace(/<[^>]*>/g, ''),
    });
    return true;
  } catch (err) {
    logger.error("Failed to send custom email", { error: err.message, to });
    return false;
  }
};


module.exports = { 
  sendTrialLicenseEmail, 
  sendPaymentApproved, 
  sendPaymentRejected,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendReceiptEmail,
  sendTrialReminder5Days,
  sendTrialReminder1Day,
  sendTrialExpired,
  sendUserApprovedWithLicenseEmail,
  sendMaintenanceNotification,
  sendMaintenanceCompleted,
  sendCustomEmail      
};