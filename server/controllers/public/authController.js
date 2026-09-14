const User = require('../../models/client/User');
const Client = require('../../models/admin/Client');
const { comparePassword, hashPassword } = require('../../utils/password');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../../utils/jwt');
const emailService = require('../../services/emailService');
const { success } = require('../../utils/response');
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');
const crypto = require('crypto');

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw ApiError.unauthorized('Invalid credentials');
  if (!user.active) throw ApiError.forbidden('Account is disabled');

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) throw ApiError.unauthorized('Invalid credentials');

  const client = await Client.findById(user.tenantId);
  if (!client) throw ApiError.unauthorized('Tenant not found');
  if (client.status === 'inactive') throw ApiError.forbidden('Account pending approval');
  if (client.status === 'rejected') throw ApiError.forbidden('Account was rejected');

  const payload = {
    type: 'client',
    userId: user._id.toString(),
    tenantId: client._id.toString(),
    role: user.role
  };

  user.lastLoginAt = new Date();
  await user.save();

  return success(res, {
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    client: { id: client._id, name: client.name, slug: client.slug, plan: client.plan, status: client.status },
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload)
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

  if (payload.type !== 'client') throw ApiError.forbidden('Not a client token');

  const user = await User.findById(payload.userId);
  if (!user || !user.active) throw ApiError.unauthorized('User not found or inactive');

  const newPayload = {
    type: 'client',
    userId: user._id.toString(),
    tenantId: user.tenantId.toString(),
    role: user.role
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
  const user = await User.findById(req.user.userId).select('-passwordHash');
  if (!user) throw ApiError.notFound('User not found');

  const client = await Client.findById(req.user.tenantId).select('-__v');
  if (!client) throw ApiError.notFound('Tenant not found');

  return success(res, { user, client }, 'OK');
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });

  if (user) {
    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    const resetUrl = `${process.env.APP_URL || ''}/reset-password?token=${token}`;
    await emailService.sendPasswordReset(user, resetUrl).catch(() => {});
  }

  return success(res, null, 'If that email exists, a reset link was sent');
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!newPassword || newPassword.length < 8) {
    throw ApiError.badRequest('Password must be at least 8 characters');
  }

  const user = await User.findOne({
    resetToken: token,
    resetTokenExpiry: { $gt: new Date() }
  });

  if (!user) throw ApiError.badRequest('Invalid or expired token');

  user.passwordHash = await hashPassword(newPassword);
  user.resetToken = null;
  user.resetTokenExpiry = null;
  await user.save();

  return success(res, null, 'Password reset successful');
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!newPassword || newPassword.length < 8) {
    throw ApiError.badRequest('Password must be at least 8 characters');
  }

  const user = await User.findById(req.user.userId);
  if (!user) throw ApiError.notFound('User not found');

  const valid = await comparePassword(currentPassword, user.passwordHash);
  if (!valid) throw ApiError.unauthorized('Current password is incorrect');

  user.passwordHash = await hashPassword(newPassword);
  await user.save();

  return success(res, null, 'Password changed');
});

module.exports = {
  login,
  refresh,
  logout,
  me,
  forgotPassword,
  resetPassword,
  changePassword
};