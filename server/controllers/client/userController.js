const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/AppError");
const { success } = require("../../utils/apiResponse");
const { generateClientToken } = require("../../utils/generateToken");
const User = require("../../models/client/User");

// @desc    Staff login
// @route   POST /api/client/users/login
// @access  Public
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new AppError("Email and password required", 400);

  const user = await User.findOne({ clientId: req.clientId, email, active: true }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Invalid credentials", 401);
  }

  const token = generateClientToken(user);
  success(res, {
    user: { id: user._id, name: user.name, email: user.email, role: user.role, permissions: user.permissions },
    token,
  }, "Login successful");
});

// @desc    Register staff
// @route   POST /api/client/users/register
// @access  Private (Owner)
const register = catchAsync(async (req, res) => {
  if (req.user.role !== "owner") throw new AppError("Only owner can add staff", 403);

  const user = await User.create({ ...req.body, clientId: req.clientId });
  success(res, { id: user._id, name: user.name, email: user.email, role: user.role }, "User created", 201);
});

// @desc    Get all users
// @route   GET /api/client/users
// @access  Private (Owner/Admin)
const getUsers = catchAsync(async (req, res) => {
  const users = await User.find({ clientId: req.clientId, active: true }).select("-password").lean();
  success(res, users);
});

// @desc    Update user
// @route   PUT /api/client/users/:id
// @access  Private (Owner/Admin)
const updateUser = catchAsync(async (req, res) => {
  const updates = req.body;
  delete updates.password;
  const user = await User.findOneAndUpdate(
    { _id: req.params.id, clientId: req.clientId },
    updates,
    { new: true, runValidators: true }
  ).select("-password");
  if (!user) throw new AppError("User not found", 404);
  success(res, user, "User updated");
});

// @desc    Deactivate user
// @route   DELETE /api/client/users/:id
// @access  Private (Owner/Admin)
const deleteUser = catchAsync(async (req, res) => {
  const user = await User.findOneAndUpdate(
    { _id: req.params.id, clientId: req.clientId },
    { active: false },
    { new: true }
  );
  if (!user) throw new AppError("User not found", 404);
  success(res, null, "User deactivated");
});

module.exports = { login, register, getUsers, updateUser, deleteUser };