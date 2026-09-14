const Client = require('../../models/admin/Client');
const Payment = require('../../models/admin/Payment');
const Notification = require('../../models/admin/Notification');
const { success } = require('../../utils/response');
const asyncHandler = require('../../utils/asyncHandler');

const overview = asyncHandler(async (req, res) => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalClients,
    activeClients,
    trials,
    renewals,
    suspended,
    pendingApprovals,
    recentSignups,
    recentPayments,
    unreadNotifications
  ] = await Promise.all([
    Client.countDocuments({}),
    Client.countDocuments({ status: 'active' }),
    Client.countDocuments({ status: 'trialing' }),
    Client.countDocuments({ status: 'renewal' }),
    Client.countDocuments({ status: 'suspended' }),
    Client.countDocuments({ status: 'inactive' }),
    Client.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    Payment.find({ status: 'succeeded', createdAt: { $gte: thirtyDaysAgo } }).lean(),
    Notification.countDocuments({ adminId: req.admin.adminId, read: false })
  ]);

  const revenueMinor = recentPayments.reduce((sum, p) => sum + (p.amountMinor || 0), 0);

  return success(res, {
    clients: { total: totalClients, active: activeClients, trials, renewals, suspended, pendingApprovals, recentSignups },
    revenue: { last30DaysMinor: revenueMinor, currency: 'KES' },
    notifications: { unread: unreadNotifications }
  }, 'Dashboard overview');
});

module.exports = { overview };