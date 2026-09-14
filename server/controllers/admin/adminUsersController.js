const AdminUser = require('../../models/admin/AdminUser');
const { hashPassword, generateRandomPassword } = require('../../utils/password');
const emailService = require('../../services/emailService');
const { success, created, paginated } = require('../../utils/response');
const { getPagination, buildPaginationMeta } = require('../../utils/pagination');
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');

const list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { role, active } = req.query;

  const query = {};
  if (role) query.role = role;
  if (active !== undefined) query.active = active === 'true';

  const [items, total] = await Promise.all([
    AdminUser.find(query).select('-passwordHash -twoFactorSecret').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    AdminUser.countDocuments(query)
  ]);

  return paginated(res, items, buildPaginationMeta(total, page, limit));
});

const getOne = asyncHandler(async (req, res) => {
  const admin = await AdminUser.findById(req.params.id).select('-passwordHash -twoFactorSecret').lean();
  if (!admin) throw ApiError.notFound('Admin not found');
  return success(res, admin, 'Admin');
});

const invite = asyncHandler(async (req, res) => {
  const { name, email, role } = req.body;

  const existing = await AdminUser.findOne({ email: email.toLowerCase() });
  if (existing) throw ApiError.conflict('Email already registered');

  const tempPassword = generateRandomPassword(12);
  const passwordHash = await hashPassword(tempPassword);

  const admin = await AdminUser.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role: role || 'admin',
    active: true
  });

  await emailService.send(
    {
      to: admin.email,
      template: 'adminInvite',
      data: { userName: admin.name, tempPassword, loginUrl: `${process.env.ADMIN_URL || ''}/login` }
    }
  ).catch(() => {});

  return created(res, {
    id: admin._id,
    name: admin.name,
    email: admin.email,
    role: admin.role
  }, 'Admin invited');
});

const update = asyncHandler(async (req, res) => {
  const { name, role } = req.body;

  const admin = await AdminUser.findById(req.params.id);
  if (!admin) throw ApiError.notFound('Admin not found');

  if (name) admin.name = name;
  if (role) admin.role = role;
  await admin.save();

  return success(res, admin, 'Admin updated');
});

const assignRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const allowed = ['super_admin', 'admin', 'support', 'read_only'];

  if (!allowed.includes(role)) throw ApiError.badRequest('Invalid role');

  const admin = await AdminUser.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!admin) throw ApiError.notFound('Admin not found');

  return success(res, admin, 'Role updated');
});

const deactivate = asyncHandler(async (req, res) => {
  const admin = await AdminUser.findById(req.params.id);
  if (!admin) throw ApiError.notFound('Admin not found');
  if (admin._id.toString() === req.admin.adminId) throw ApiError.badRequest('Cannot deactivate yourself');

  admin.active = false;
  await admin.save();

  return success(res, admin, 'Admin deactivated');
});

const activate = asyncHandler(async (req, res) => {
  const admin = await AdminUser.findById(req.params.id);
  if (!admin) throw ApiError.notFound('Admin not found');

  admin.active = true;
  await admin.save();

  return success(res, admin, 'Admin activated');
});

const resetPassword = asyncHandler(async (req, res) => {
  const admin = await AdminUser.findById(req.params.id);
  if (!admin) throw ApiError.notFound('Admin not found');

  const tempPassword = generateRandomPassword(12);
  admin.passwordHash = await hashPassword(tempPassword);
  await admin.save();

  return success(res, { tempPassword }, 'Password reset');
});

module.exports = {
  list,
  getOne,
  invite,
  update,
  assignRole,
  deactivate,
  activate,
  resetPassword
};