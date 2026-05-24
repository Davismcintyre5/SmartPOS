// controllers/public/landingController.js
const catchAsync = require("../../utils/catchAsync");
const Content = require("../../models/public/Content");
const System = require("../../models/admin/System");
const Subscription = require("../../models/admin/Subscription");
const PaymentMethod = require("../../models/admin/PaymentMethod");
const AIConfig = require("../../models/admin/AIConfig");
const Currency = require("../../models/admin/Currency");
const { convertCurrency } = require("../../utils/currencyConverter");

// @desc    Get landing page content
// @route   GET /api/public/landing/content
// @access  Public
const getLandingContent = catchAsync(async (req, res) => {
  const content = await Content.find({ active: true }).lean();
  res.json({ success: true, content });
});

// @desc    Get section content
// @route   GET /api/public/landing/content/:section
// @access  Public
const getSectionContent = catchAsync(async (req, res) => {
  const content = await Content.findOne({ section: req.params.section, active: true }).lean();
  res.json({ success: true, content });
});

// @desc    Submit contact inquiry
// @route   POST /api/public/landing/inquiry
// @access  Public
const submitInquiry = catchAsync(async (req, res) => {
  const inquiry = await Inquiry.create(req.body);
  res.json({ success: true, message: "Inquiry submitted" });
});

// @desc    Get downloads
// @route   GET /api/public/system/downloads
// @access  Public
const getDownloads = catchAsync(async (req, res) => {
  const settings = await System.findOne().lean();
  res.json({
    success: true,
    downloads: {
      mobileAppEnabled: settings?.mobileAppEnabled || false,
      mobileAppUrl: settings?.mobileAppUrl || "",
      desktopAppEnabled: settings?.desktopAppEnabled || false,
      desktopAppUrl: settings?.desktopAppUrl || "",
    },
  });
});

// @desc    Get AI status
// @route   GET /api/public/system/ai-status
// @access  Public
const getAIStatus = catchAsync(async (req, res) => {
  const config = await AIConfig.findOne().lean();
  const system = await System.findOne().lean();
  res.json({
    success: true,
    landingEnabled: config?.landingEnabled || false,
    clientEnabled: config?.clientEnabled !== false,
    outwardKeyEnabled: config?.outwardKeyEnabled !== false,
    maintenanceMode: system?.maintenanceMode || false,
  });
});

// @desc    Get pricing plans
// @route   GET /api/public/system/plans
// @access  Public
const getPlans = catchAsync(async (req, res) => {
  let plan = await Subscription.findOne().lean();
  if (!plan) {
    plan = { priceMonthly: 500, priceYearly: 5000, pricePermanent: 12000, currency: "KES", freeTrialDays: 14 };
  }

  const currencySetting = await Currency.findOne().lean();
  const base = currencySetting?.baseCurrency || "KES";

  if (base !== "KES") {
    plan = { ...plan };
    plan.priceMonthly = convertCurrency(plan.priceMonthly, "KES", base);
    plan.priceYearly = convertCurrency(plan.priceYearly, "KES", base);
    plan.pricePermanent = convertCurrency(plan.pricePermanent, "KES", base);
    plan.currency = base;
  }

  res.json({ success: true, plans: plan });
});

// @desc    Get payment methods
// @route   GET /api/public/system/payment-methods
// @access  Public
const getPaymentMethods = catchAsync(async (req, res) => {
  const methods = await PaymentMethod.findOne().lean();
  res.json({ success: true, methods });
});

module.exports = { getLandingContent, getSectionContent, submitInquiry, getDownloads, getAIStatus, getPlans, getPaymentMethods };