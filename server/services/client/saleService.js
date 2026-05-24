// services/client/saleService.js
const Sale = require("../../models/client/Sale");
const Product = require("../../models/client/Product");
const AppError = require("../../utils/AppError");

const getSales = async (clientId, filters = {}) => {
  const { receipt, method, page = 1, limit = 50, cashier } = filters;
  const query = { clientId, status: { $ne: "held" } };

  if (receipt) query.receiptNumber = { $regex: receipt, $options: "i" };
  if (method) query.paymentMethod = method;
  if (cashier) query.cashier = cashier;

  const [sales, total] = await Promise.all([
    Sale.find(query)
      .populate("cashier", "name email")
      .sort("-createdAt")
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Sale.countDocuments(query),
  ]);

  return { sales, total, page: Number(page), pages: Math.ceil(total / limit) };
};

const getSaleById = async (clientId, id) => {
  const sale = await Sale.findOne({ _id: id, clientId })
    .populate("cashier", "name email")
    .lean();
  if (!sale) throw new AppError("Sale not found", 404);
  return sale;
};

const refundSale = async (clientId, saleId, reason) => {
  const sale = await Sale.findOne({ _id: saleId, clientId, status: "completed" });
  if (!sale) throw new AppError("Sale not found or already refunded", 404);

  for (const item of sale.items) {
    await Product.findOneAndUpdate(
      { clientId, _id: item.product },
      { $inc: { stock: item.quantity } }
    );
  }

  sale.status = "refunded";
  sale.refundReason = reason || "";
  sale.refundedAt = new Date();
  await sale.save();
  return sale;
};

module.exports = { getSales, getSaleById, refundSale };