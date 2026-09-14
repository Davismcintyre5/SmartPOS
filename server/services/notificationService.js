const Notification = require('../models/admin/Notification');
const AdminUser = require('../models/admin/AdminUser');
const logger = require('../utils/logger');

async function notifyAdmins(type, payload) {
  try {
    const admins = await AdminUser.find({ active: true }).select('_id');
    if (!admins.length) return;

    const docs = admins.map((admin) => ({
      adminId: admin._id,
      type,
      title: payload.title,
      message: payload.message,
      link: payload.link || null,
      read: false
    }));

    await Notification.insertMany(docs);
    logger.info({ type, count: docs.length }, 'Admin notifications created');
  } catch (err) {
    logger.error({ err, type }, 'Failed to create admin notifications');
  }
}

async function listForAdmin(adminId, { page = 1, limit = 20, unreadOnly = false }) {
  const query = { adminId };
  if (unreadOnly) query.read = false;

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Notification.countDocuments(query)
  ]);

  return { items, total, page, limit };
}

async function markRead(notificationId, adminId) {
  return Notification.findOneAndUpdate(
    { _id: notificationId, adminId },
    { read: true },
    { new: true }
  );
}

async function markAllRead(adminId) {
  return Notification.updateMany({ adminId, read: false }, { read: true });
}

async function getUnreadCount(adminId) {
  return Notification.countDocuments({ adminId, read: false });
}

module.exports = {
  notifyAdmins,
  listForAdmin,
  markRead,
  markAllRead,
  getUnreadCount
};