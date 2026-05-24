// controllers/public/chatController.js
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/AppError");
const AIConfig = require("../../models/admin/AIConfig");
const Subscription = require("../../models/admin/Subscription");
const env = require("../../config/env");
const axios = require("axios");

// @desc    Public AI chat
// @route   POST /api/public/chat
// @access  Public
const chat = catchAsync(async (req, res) => {
  const config = await AIConfig.findOne().lean();
  if (!config?.landingEnabled) throw new AppError("AI chat is currently disabled", 403);

  const { message, client_id, conversation_id } = req.body;
  if (!message) throw new AppError("Message required", 400);

  // Get pricing info for accurate answers
  const plan = await Subscription.findOne().lean();
  const pricing = plan ? {
    trial: `Free ${plan.freeTrialDays || 14} days`,
    monthly: `${plan.currency || "KES"} ${plan.priceMonthly || 500}/month`,
    yearly: `${plan.currency || "KES"} ${plan.priceYearly || 5000}/year`,
    permanent: `${plan.currency || "KES"} ${plan.pricePermanent || 12000} one-time`,
  } : {};

  try {
    const { data } = await axios.post(
      `${env.HDM_AI_BASE_URL}/smartpos/public/chat`,
      {
        message,
        client_id: client_id || "visitor",
        conversation_id: conversation_id || null,
        feature: "public",
        data: {
          context: "landing_page",
          features: [
            "Fast barcode scanning (camera + external scanner)",
            "M-Pesa integration (STK Push, Send Money, Till, Paybill)",
            "Multi-currency support (KES, USD, EUR, GBP, UGX, TZS, RWF, BIF, ZAR, NGN, GHS)",
            "Offline-first — works without internet",
            "AI-powered insights and analytics",
            "Staff management with roles and permissions",
            "Customer management with loyalty points",
            "Multi-user support (owner, admin, manager, cashier)",
            "Receipt customization and printing",
            "Tax and discount management",
            "Cloud backups",
          ],
          pricing,
          support: {
            email: "support@smartpos.com",
            phone: "+254768784909",
            hours: "Monday - Friday, 8 AM - 6 PM EAT",
          },
        },
      },
      { headers: { "x-api-key": env.HDM_AI_API_KEY, "Content-Type": "application/json" }, timeout: 15000 }
    );
    res.json({ success: true, data: data.data });
  } catch {
    res.json({ success: true, data: { reply: "AI is temporarily unavailable. Please try again later." } });
  }
});

module.exports = { chat };