// services/client/reportService.js
const mongoose = require("mongoose");
const Sale = require("../../models/client/Sale");
const Product = require("../../models/client/Product");

const getSalesReport = async (clientId, period = "today") => {
  const now = new Date();
  let startDate;

  if (period === "today") {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (period === "week") {
    startDate = new Date(now);
    startDate.setDate(now.getDate() - now.getDay());
    startDate.setHours(0, 0, 0, 0);
  } else if (period === "month") {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  } else {
    startDate = new Date(0);
  }

  const objectId = new mongoose.Types.ObjectId(clientId);

  const match = {
    clientId: objectId,
    status: "completed",
    createdAt: { $gte: startDate },
  };

  const [salesStats, paymentBreakdown] = await Promise.all([
    Sale.aggregate([
      { $match: match },
      { $group: { _id: null, totalSales: { $sum: "$total" }, transactionCount: { $sum: 1 } } },
    ]),
    Sale.aggregate([
      { $match: match },
      { $group: { _id: "$paymentMethod", total: { $sum: "$total" }, count: { $sum: 1 } } },
    ]),
  ]);

  const stats = salesStats[0] || { totalSales: 0, transactionCount: 0 };
  return {
    totalSales: stats.totalSales,
    transactions: stats.transactionCount,
    averageTransaction: stats.transactionCount ? Math.round((stats.totalSales / stats.transactionCount) * 100) / 100 : 0,
    paymentMethods: paymentBreakdown,
  };
};

const getInventoryReport = async (clientId) => {
  const objectId = new mongoose.Types.ObjectId(clientId);

  const [total, lowStock, outOfStock] = await Promise.all([
    Product.countDocuments({ clientId: objectId }),
    Product.find({ clientId: objectId, stock: { $gt: 0, $lte: 10 } }).lean(),
    Product.find({ clientId: objectId, stock: 0 }).lean(),
  ]);

  return {
    totalProducts: total,
    lowStockCount: lowStock.length,
    outOfStockCount: outOfStock.length,
    lowStockItems: lowStock,
    outOfStockItems: outOfStock,
  };
};

module.exports = { getSalesReport, getInventoryReport };