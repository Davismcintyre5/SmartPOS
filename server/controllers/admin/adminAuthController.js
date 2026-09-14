const AdminUser = require('../../models/admin/AdminUser');
const { comparePassword, hashPassword } = require('../../utils/password');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../../utils/jwt');
const { success } = require('../../utils/response');
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const admin = await AdminUser.findOne({ email: email.toLowerCase() });
  if (!admin) throw ApiError.unauthorized('Invalid credentials');
  if (!admin.active) throw ApiError.forbidden('Account is disabled');

  const valid = await comparePassword(password, admin.passwordHash);
  if (!valid) throw ApiError.unauthorized('Invalid credentials');

  const payload = {
    type: 'admin',
    adminId: admin._id.toString(),
    email: admin.email,
    role: admin.role
  };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  admin.lastLoginAt = new Date();
  await admin.save();

  return success(res, {
    admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
    accessToken,
    refreshToken
  }, 'Login successful');
});

const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw ApiError.badRequest('Refresh token required');

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw ApiError.unauthorized('Invalid refresh token');
  }

  if (payload.type !== 'admin') throw ApiError.forbidden('Not an admin token');

  const admin = await AdminUser.findById(payload.adminId);
  if (!admin || !admin.active) throw ApiError.unauthorized('Admin not found or inactive');

  const newPayload = {
    type: 'admin',
    adminId: admin._id.toString(),
    email: admin.email,
    role: admin.role
  };

  return success(res, {
    accessToken: signAccessToken(newPayload),
    refreshToken: signRefreshToken(newPayload)
  }, 'Token refreshed');
});

const logout = asyncHandler(async (req, res) => {
  return success(res, null, 'Logged out');
});

const me = asyncHandler(async (req, res) => {
  const admin = await AdminUser.findById(req.admin.adminId).select('-passwordHash -twoFactorSecret');
  if (!admin) throw ApiError.notFound('Admin not found');
  return success(res, admin, 'OK');
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!newPassword || newPassword.length < 8) {
    throw ApiError.badRequest('Password must be at least 8 characters');
  }

  const admin = await AdminUser.findById(req.admin.adminId);
  if (!admin) throw ApiError.notFound('Admin not found');

  const valid = await comparePassword(currentPassword, admin.passwordHash);
  if (!valid) throw ApiError.unauthorized('Current password is incorrect');

  admin.passwordHash = await hashPassword(newPassword);
  await admin.save();

  return success(res, null, 'Password changed');
});

module.exports = { login, refresh, logout, me, changePassword };