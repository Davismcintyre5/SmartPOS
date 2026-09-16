const User = require('../../models/client/User');
const { hashPassword } = require('../../utils/password');
const emailService = require('../../services/emailService');
const { success, created } = require('../../utils/response');
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');

const list = asyncHandler(async (req, res) => {
  const items = await User.find({ tenantId: req.tenant._id })
    .select('-passwordHash -resetToken -resetTokenExpiry')
    .sort({ createdAt: -1 })
    .lean();
  return success(res, items, 'Staff');
});

const invite = asyncHandler(async (req, res) => {
  const { name, email, phone, role = 'cashier', password } = req.body;

  if (!name || !email) throw ApiError.badRequest('name and email required');

  const existing = await User.findOne({ tenantId: req.tenant._id, email: email.toLowerCase() });
  if (existing) throw ApiError.conflict('Email already in use');

  const tempPassword = password || Math.random().toString(36).slice(-10) + 'A1!';
  const passwordHash = await hashPassword(tempPassword);

  const user = await User.create({
    tenantId: req.tenant._id,
    name,
    email: email.toLowerCase(),
    phone: phone || '',
    passwordHash,
    role,
    active: true
  });

  return created(res, {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    tempPassword: password ? undefined : tempPassword
  }, 'Staff invited');
});

const update = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, tenantId: req.tenant._id });
  if (!user) throw ApiError.notFound('Staff not found');

  const { name, phone, role } = req.body;
  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (role) user.role = role;
  await user.save();

  return success(res, user, 'Staff updated');
});

const deactivate = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, tenantId: req.tenant._id });
  if (!user) throw ApiError.notFound('Staff not found');
  if (user._id.toString() === req.user.userId) throw ApiError.badRequest('Cannot deactivate yourself');

  user.active = false;
  await user.save();
  return success(res, null, 'Staff deactivated');
});

const assignRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['owner', 'manager', 'cashier'].includes(role)) {
    throw ApiError.badRequest('Invalid role');
  }

  const user = await User.findOne({ _id: req.params.id, tenantId: req.tenant._id });
  if (!user) throw ApiError.notFound('Staff not found');

  user.role = role;
  await user.save();

  return success(res, user, 'Role assigned');
});

const resetPin = asyncHandler(async (req, res) => {
  const { pin } = req.body;
  if (!pin || pin.length < 4) throw ApiError.badRequest('PIN must be at least 4 digits');

  const user = await User.findOne({ _id: req.params.id, tenantId: req.tenant._id });
  if (!user) throw ApiError.notFound('Staff not found');

  user.pin = pin;
  await user.save();

  return success(res, null, 'PIN reset');
});

module.exports = { list, invite, update, deactivate, assignRole, resetPin };