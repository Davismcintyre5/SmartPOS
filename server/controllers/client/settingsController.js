// controllers/client/settingsController.js
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/AppError");
const { success } = require("../../utils/apiResponse");
const User = require("../../models/client/User");
const Client = require("../../models/admin/Client");
const ReceiptSettings = require("../../models/client/ReceiptSettings");

// @desc    Update profile
// @route   PUT /api/client/settings/profile
// @access  Private (Client)
const updateProfile = catchAsync(async (req, res) => {
  const { name, password } = req.body;
  const updates = {};
  if (name) updates.name = name;
  if (password) updates.password = password;

  const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select("-password");
  if (!user) throw new AppError("User not found", 404);
  success(res, user, "Profile updated");
});

// @desc    Get business settings
// @route   GET /api/client/settings/business
// @access  Private (Client)
const getBusinessSettings = catchAsync(async (req, res) => {
  const client = await Client.findById(req.clientId).select("businessName ownerName email phone address currency").lean();
  success(res, client);
});

// @desc    Update business settings
// @route   PUT /api/client/settings/business
// @access  Private (Client)
const updateBusinessSettings = catchAsync(async (req, res) => {
  const client = await Client.findByIdAndUpdate(req.clientId, req.body, { new: true, runValidators: true })
    .select("businessName ownerName email phone address currency");
  if (!client) throw new AppError("Client not found", 404);
  success(res, client, "Business settings updated");
});

// @desc    Get receipt settings
// @route   GET /api/client/settings/receipt
// @access  Private (Client)
const getReceiptSettings = catchAsync(async (req, res) => {
  let settings = await ReceiptSettings.findOne({ clientId: req.clientId }).lean();

  if (!settings) {
    const client = await Client.findById(req.clientId).lean();
    const defaultHeader = `${client?.businessName || "SmartPOS"}\n${client?.address || ""}`;
    settings = await ReceiptSettings.findOneAndUpdate(
      { clientId: req.clientId },
      {
        receiptHeader: defaultHeader,
        receiptFooter: "Thank you for shopping with us!",
        vatRate: 0,
        vatEnabled: false,
        globalDiscountEnabled: false,
        globalDiscountName: "Discount",
        globalDiscountRate: 0,
        specificDiscounts: [],
        loyaltyEnabled: false,
        loyaltyPointsPerAmount: 100,
        loyaltyLabel: "Loyalty Points",
      },
      { upsert: true, new: true }
    ).lean();
  }

  // If header is empty, fill with business name
  if (!settings.receiptHeader) {
    const client = await Client.findById(req.clientId).lean();
    const defaultHeader = `${client?.businessName || "SmartPOS"}\n${client?.address || ""}`;
    settings = await ReceiptSettings.findOneAndUpdate(
      { clientId: req.clientId },
      { receiptHeader: defaultHeader },
      { new: true }
    ).lean();
  }

  success(res, settings);
});

// @desc    Update receipt settings
// @route   PUT /api/client/settings/receipt
// @access  Private (Client)
const updateReceiptSettings = catchAsync(async (req, res) => {
  const settings = await ReceiptSettings.findOneAndUpdate(
    { clientId: req.clientId },
    req.body,
    { upsert: true, new: true, runValidators: true }
  );
  success(res, settings, "Receipt settings updated");
});

module.exports = { updateProfile, getBusinessSettings, updateBusinessSettings, getReceiptSettings, updateReceiptSettings };