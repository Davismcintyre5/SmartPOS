// controllers/public/authController.js
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/AppError");
const { generateClientToken } = require("../../utils/generateToken");
const Client = require("../../models/admin/Client");
const User = require("../../models/client/User");
const License = require("../../models/public/License");
const licenseService = require("../../services/public/licenseService");
const emailService = require("../../services/public/emailService");

// @desc    Register new client (free trial)
// @route   POST /api/public/auth/register
// @access  Public
const register = catchAsync(async (req, res) => {
  const { businessName, ownerName, email, phone, password, address, currency } = req.body;

  const exists = await Client.findOne({ email });
  if (exists) throw new AppError("A business with this email already exists. Please login or use a different email.", 409);

  const client = await Client.create({ businessName, ownerName, email, phone, address, currency });
  const license = await licenseService.createTrialLicense(client._id);

  await User.create({
    clientId: client._id,
    name: ownerName,
    email,
    password,
    role: "owner",
    isOwner: true,
    permissions: { manageProducts: true, processSales: true, manageCustomers: true, viewReports: true, manageStaff: true, processRefunds: true },
  });

  await emailService.sendTrialLicenseEmail(email, businessName, license.licenseKey);

  res.json({
    success: true,
    message: "Registration successful",
    licenseKey: license.licenseKey,
    client: { id: client._id, businessName: client.businessName },
  });
});

// @desc    Register pending (paid plan)
// @route   POST /api/public/auth/register-pending
// @access  Public
const registerPending = catchAsync(async (req, res) => {
  const { businessName, ownerName, email, phone, password, address, currency, plan } = req.body;

  const exists = await Client.findOne({ email });
  if (exists) throw new AppError("A business with this email already exists. Please login or use a different email.", 409);

  const client = await Client.create({ businessName, ownerName, email, phone, address, currency, plan, status: "inactive" });

  await User.create({
    clientId: client._id,
    name: ownerName,
    email,
    password,
    role: "owner",
    isOwner: true,
    active: false,
  });

  res.json({
    success: true,
    message: "Registration pending payment",
    clientId: client._id,
    client: { id: client._id, businessName: client.businessName },
  });
});

// @desc    Client login
// @route   POST /api/public/auth/login
// @access  Public
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Invalid email or password", 401);
  }

  if (!user.active) {
    throw new AppError("Your account is pending approval. You'll receive an email once approved.", 403);
  }

  const client = await Client.findById(user.clientId);
  if (!client || client.status === "suspended") {
    throw new AppError("Account is suspended. Please contact support.", 403);
  }

  if (client.status === "inactive") {
    throw new AppError("Your account is pending approval. You'll receive an email once approved.", 403);
  }

  const license = await License.findOne({ clientId: user.clientId, status: "active" });
  const isActivated = license && license.devices && license.devices.length > 0;

  if (!isActivated) {
    return res.json({
      success: true,
      activated: false,
      clientId: user.clientId,
      message: "Device not activated. Please activate your license.",
    });
  }

  const token = generateClientToken(user);
  res.json({
    success: true,
    activated: true,
    user: { id: user._id, name: user.name, email: user.email, role: user.role, permissions: user.permissions },
    token,
    clientId: user.clientId,
    businessName: client.businessName,
  });
});

// @desc    Verify license key
// @route   POST /api/public/auth/verify-license
// @access  Public
const verifyLicense = catchAsync(async (req, res) => {
  const { licenseKey, deviceId } = req.body;
  const result = await licenseService.verifyLicense(licenseKey, deviceId || "web-device");
  res.json({ success: true, ...result });
});

module.exports = { register, registerPending, login, verifyLicense };