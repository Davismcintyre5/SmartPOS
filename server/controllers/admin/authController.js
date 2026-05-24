const catchAsync = require("../../utils/catchAsync");
const { success } = require("../../utils/apiResponse");
const authService = require("../../services/admin/authService");

// @desc    Admin login
// @route   POST /api/admin/auth/login
// @access  Public
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const data = await authService.login(email, password);
  success(res, data, "Login successful");
});

// @desc    Get current admin
// @route   GET /api/admin/auth/me
// @access  Private (Admin)
const getMe = catchAsync(async (req, res) => {
  const admin = await authService.getMe(req.admin._id);
  success(res, { admin });
});

// @desc    Register new admin
// @route   POST /api/admin/auth/register
// @access  Private (Superadmin)
const register = catchAsync(async (req, res) => {
  const admin = await authService.register(req.body);
  success(res, admin, "Admin registered", 201);
});

module.exports = { login, getMe, register };