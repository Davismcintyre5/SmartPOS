// controllers/client/dashboardController.js
const catchAsync = require("../../utils/catchAsync");
const { success } = require("../../utils/apiResponse");
const Sale = require("../../models/client/Sale");
const Product = require("../../models/client/Product");
const Customer = require("../../models/client/Customer");
const mongoose = require("mongoose");

// @desc    Get client dashboard stats
// @route   GET /api/client/dashboard
// @access  Private (Client)
const getDashboard = catchAsync(async (req, res) => {
  const clientId = req.clientId;
  const cashierId = req.query.cashier || null;

  // Use start of today in local timezone (Kenya UTC+3)
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const objectId = new mongoose.Types.ObjectId(clientId);

  const saleMatch = {
    clientId: objectId,
    createdAt: { $gte: startOfToday },
    status: "completed",
  };

  if (cashierId) {
    saleMatch.cashier = new mongoose.Types.ObjectId(cashierId);
  }

  const [todaySales, totalTransactions, totalProducts, totalCustomers] = await Promise.all([
    Sale.aggregate([
      { $match: saleMatch },
      { $group: { _id: null, revenue: { $sum: "$total" } } },
    ]),
    Sale.countDocuments(saleMatch),
    Product.countDocuments({ clientId: objectId }),
    Customer.countDocuments({ clientId: objectId }),
  ]);

  const revenue = todaySales.length > 0 ? todaySales[0].revenue : 0;

  success(res, {
    todayRevenue: revenue,
    todayTransactions: totalTransactions,
    totalProducts,
    totalCustomers,
  });
});

module.exports = { getDashboard };