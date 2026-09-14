const notificationService = require('../../services/notificationService');
const { success } = require('../../utils/response');
const asyncHandler = require('../../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const unreadOnly = req.query.unread === 'true';

  const result = await notificationService.listForAdmin(req.admin.adminId, { page, limit, unreadOnly });
  return success(res, result.items, 'Notifications', 200, {
    page: result.page,
    limit: result.limit,
    total: result.total,
    pages: Math.ceil(result.total / result.limit) || 0
  });
});

const unreadCount = asyncHandler(async (req, res) => {
  const count = await notificationService.getUnreadCount(req.admin.adminId);
  return success(res, { count }, 'Unread count');
});

const markRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markRead(req.params.id, req.admin.adminId);
  return success(res, notification, 'Marked as read');
});

const markAllRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllRead(req.admin.adminId);
  return success(res, result, 'All marked as read');
});

module.exports = { list, unreadCount, markRead, markAllRead };