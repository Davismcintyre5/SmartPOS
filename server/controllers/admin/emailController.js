// controllers/admin/emailController.js
const Client = require("../../models/admin/Client");
const User = require("../../models/client/User");
const emailService = require("../../services/public/emailService");
const logger = require("../../config/logger");

/**
 * @desc    Get recipients list for email targeting
 * @route   GET /api/admin/email/recipients
 * @access  Private (Admin/Super Admin)
 */
const getRecipients = async (req, res) => {
  try {
    const [clients, users] = await Promise.all([
      Client.find({ status: "active" }).select("businessName email ownerName _id").lean(),
      User.find({ active: true }).select("name email clientId role _id").populate("clientId", "businessName").lean(),
    ]);

    // Group users by client
    const clientsWithUsers = clients.map(client => ({
      id: client._id,
      name: client.businessName,
      email: client.email,
      ownerName: client.ownerName,
      users: users.filter(u => u.clientId?._id?.toString() === client._id.toString())
    }));

    res.json({
      success: true,
      data: {
        clients: clients.map(c => ({ id: c._id, name: c.businessName, email: c.email, ownerName: c.ownerName })),
        users: users.map(u => ({ 
          id: u._id, 
          name: u.name, 
          email: u.email, 
          role: u.role,
          businessName: u.clientId?.businessName || "N/A"
        })),
        clientsWithUsers,
        totalClients: clients.length,
        totalUsers: users.length,
      }
    });
  } catch (err) {
    logger.error("Get recipients error:", err.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * @desc    Send custom email to clients/users
 * @route   POST /api/admin/email/send
 * @access  Private (Admin/Super Admin)
 */
const sendCustomEmail = async (req, res) => {
  try {
    const { to, subject, message, clientId, userId, emails, role, testMode = false } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ success: false, message: "Subject and message are required" });
    }

    let recipients = [];

    // Build recipient list based on selection
    if (to === "all-clients") {
      // Send to all active clients
      const clients = await Client.find({ status: "active" });
      recipients = clients.map(c => ({ email: c.email, name: c.businessName }));
    
    } else if (to === "all-users") {
      // Send to all active users
      const users = await User.find({ active: true }).populate("clientId", "businessName");
      recipients = users.map(u => ({ 
        email: u.email, 
        name: u.name,
        businessName: u.clientId?.businessName || "SmartPOS User"
      }));
    
    } else if (to === "all-admins") {
      // Send to all admin users
      const admins = await User.find({ active: true, role: { $in: ["owner", "admin"] } }).populate("clientId", "businessName");
      recipients = admins.map(a => ({ email: a.email, name: a.name, businessName: a.clientId?.businessName }));
    
    } else if (to === "specific-client" && clientId) {
      // Send to a specific client's contact email
      const client = await Client.findById(clientId);
      if (client) {
        recipients = [{ email: client.email, name: client.businessName }];
        
        // Optionally also send to all users of this client
        if (req.body.includeAllUsers) {
          const clientUsers = await User.find({ clientId, active: true });
          const userRecipients = clientUsers.map(u => ({ 
            email: u.email, 
            name: u.name,
            businessName: client.businessName
          }));
          recipients = [...recipients, ...userRecipients];
        }
      }
    
    } else if (to === "specific-user" && userId) {
      // Send to a specific user
      const user = await User.findById(userId).populate("clientId", "businessName");
      if (user) {
        recipients = [{ 
          email: user.email, 
          name: user.name,
          businessName: user.clientId?.businessName || "SmartPOS User"
        }];
      }
    
    } else if (to === "specific-role" && role) {
      // Send to all users with specific role
      const users = await User.find({ active: true, role }).populate("clientId", "businessName");
      recipients = users.map(u => ({ 
        email: u.email, 
        name: u.name,
        businessName: u.clientId?.businessName || "SmartPOS User"
      }));
    
    } else if (to === "custom" && emails && emails.length) {
      // Send to custom email list
      recipients = emails;
    
    } else {
      return res.status(400).json({ success: false, message: "Invalid recipient selection" });
    }

    if (!recipients.length) {
      return res.status(400).json({ success: false, message: "No recipients found" });
    }

    // Test mode - only send to admin's own email
    if (testMode) {
      const testRecipient = [{ email: req.admin?.email, name: "Admin Test" }];
      recipients = testRecipient;
    }

    // Create HTML email template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 50px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background-color: #10b981; padding: 30px 20px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
          .content { padding: 30px; }
          .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
          .button { display: inline-block; background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>SmartPOS</h1>
          </div>
          <div class="content">
            ${message}
            <hr style="margin: 20px 0; border-color: #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px;">
              This email was sent from SmartPOS Admin.<br>
              Need help? Contact <a href="mailto:support@smartpos.com">support@smartpos.com</a>
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

    let sent = 0;
    let failed = 0;

    for (const recipient of recipients) {
      try {
        await emailService.sendCustomEmail({
          to: recipient.email,
          toName: recipient.name || recipient.email,
          subject,
          htmlContent,
        });
        sent++;
        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 100));
      } catch (err) {
        failed++;
        logger.warn(`Email failed for ${recipient.email}:`, err.message);
      }
    }

    res.json({
      success: true,
      message: `Email sent to ${sent} of ${recipients.length} recipients`,
      total: recipients.length,
      sent,
      failed,
      testMode: testMode || false,
    });
  } catch (err) {
    logger.error("Send custom email error:", err.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * @desc    Send test email to admin
 * @route   POST /api/admin/email/test
 * @access  Private (Admin)
 */
const sendTestEmail = async (req, res) => {
  try {
    const { subject, message } = req.body;
    const adminEmail = req.admin?.email;

    if (!adminEmail) {
      return res.status(400).json({ success: false, message: "Admin email not found" });
    }

    await emailService.sendCustomEmail({
      to: adminEmail,
      toName: req.admin?.name || "Admin",
      subject: `[TEST] ${subject || "Test Email"}`,
      htmlContent: `
        <div style="font-family:Arial,sans-serif;padding:20px;">
          <h2 style="color:#10B981;">SmartPOS Test Email</h2>
          <div style="margin:20px 0;">${message || "This is a test email from SmartPOS Admin."}</div>
          <p style="color:#6b7280;font-size:12px;">Test mode — no actual recipients were contacted.</p>
        </div>
      `,
    });

    res.json({ success: true, message: "Test email sent to your inbox" });
  } catch (err) {
    logger.error("Send test email error:", err.message);
    res.status(500).json({ success: false, message: "Failed to send test email" });
  }
};

module.exports = { getRecipients, sendCustomEmail, sendTestEmail };