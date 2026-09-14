const AuditLog = require('../../models/admin/AuditLog');
const { success, paginated } = require('../../utils/response');
const { getPagination, buildPaginationMeta } = require('../../utils/pagination');
const asyncHandler = require('../../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { adminId, action, targetType, from, to } = req.query;

  const query = {};
  if (adminId) query.adminId = adminId;
  if (action) query.action = action;
  if (targetType) query.targetType = targetType;
  if (from || to) {
    query.createdAt = {};
    if (from) query.createdAt.$gte = new Date(from);
    if (to) query.createdAt.$lte = new Date(to);
  }

  const [items, total] = await Promise.all([
    AuditLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    AuditLog.countDocuments(query)
  ]);

  return paginated(res, items, buildPaginationMeta(total, page, limit));
});

const getForTarget = asyncHandler(async (req, res) => {
  const items = await AuditLog.find({ targetId: req.params.targetId }).sort({ createdAt: -1 }).lean();
  return success(res, items, 'Audit log for target');
});

module.exports = { list, getForTarget };