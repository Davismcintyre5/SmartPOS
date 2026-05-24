const catchAsync = require("../../utils/catchAsync");
const { success } = require("../../utils/apiResponse");
const Client = require("../../models/admin/Client");
const Payment = require("../../models/admin/Payment");

// @desc    Get admin dashboard overview
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
const getDashboard = catchAsync(async (req, res) => {
  const [totalClients, activeClients, trialClients, pendingPayments, revenueAgg] = await Promise.all([
    Client.countDocuments(),
    Client.countDocuments({ status: "active" }),
    Client.countDocuments({ plan: "trial", status: "active" }),
    Payment.countDocuments({ status: "pending" }),
    Payment.aggregate([
      { $match: { status: "approved" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
  ]);

  const recentPayments = await Payment.find({ status: "approved" })
    .populate("client", "businessName email")
    .sort("-createdAt")
    .limit(5)
    .lean();

  success(res, {
    totalClients,
    activeClients,
    trialClients,
    pendingPayments,
    totalRevenue: revenueAgg[0]?.total || 0,
    recentPayments,
  });
});

module.exports = { getDashboard };