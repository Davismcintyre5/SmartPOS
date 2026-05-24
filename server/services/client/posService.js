// services/client/posService.js
const Product = require("../../models/client/Product");
const Sale = require("../../models/client/Sale");
const ReceiptSettings = require("../../models/client/ReceiptSettings");
const Customer = require("../../models/client/Customer");
const AppError = require("../../utils/AppError");

const processSale = async (clientId, { items, discount = 0, paymentMethod, customerName, vatRate = 0, vatAmount = 0, amountPaid = 0, changeAmount = 0, loyaltyCardNumber = "" }, cashierId) => {
  if (!items || items.length === 0) throw new AppError("No items in cart", 400);
  if (!paymentMethod) throw new AppError("Payment method required", 400);

  let subtotal = 0;
  const saleItems = [];

  for (const item of items) {
    const product = await Product.findOne({ clientId, _id: item.product || item.productId });
    if (!product) throw new AppError("Product not found", 404);
    if (product.stock < (item.quantity || 1)) {
      throw new AppError(`Insufficient stock for "${product.name}". Available: ${product.stock}`, 400);
    }

    const price = item.price || product.price;
    const quantity = item.quantity || 1;
    const total = price * quantity;
    subtotal += total;

    saleItems.push({
      product: product._id,
      name: product.name,
      barcode: product.barcode,
      price,
      quantity,
      total,
    });

    await Product.findByIdAndUpdate(product._id, { $inc: { stock: -quantity } });
  }

  const total = Math.max(0, Math.round((subtotal - discount + vatAmount) * 100) / 100);
  const receiptNumber = `RCP-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  const sale = await Sale.create({
    clientId,
    receiptNumber,
    items: saleItems,
    subtotal,
    discount,
    total,
    vatRate,
    vatAmount,
    amountPaid: amountPaid || total,
    changeAmount: changeAmount || 0,
    paymentMethod,
    customerName: customerName || "",
    cashier: cashierId,
  });

  // Loyalty points
  if (loyaltyCardNumber && loyaltyCardNumber.trim()) {
    const settings = await ReceiptSettings.findOne({ clientId });
    if (settings && settings.loyaltyEnabled) {
      const points = Math.floor(total / (settings.loyaltyPointsPerAmount || 100));
      await Customer.findOneAndUpdate(
        { clientId, loyaltyCardNumber: loyaltyCardNumber.trim() },
        { $inc: { loyaltyPoints: points, totalSpent: total, visitCount: 1 } },
        { upsert: false }
      );
    }
  }

  return sale;
};

const holdSale = async (clientId, { items, discount = 0, customerName }, cashierId) => {
  if (!items || items.length === 0) throw new AppError("No items in cart", 400);

  let subtotal = 0;
  const saleItems = [];

  for (const item of items) {
    const product = await Product.findOne({ clientId, _id: item.productId || item.product });
    const price = item.price || (product ? product.price : 0);
    const quantity = item.quantity || 1;
    const total = price * quantity;
    subtotal += total;

    saleItems.push({
      product: product ? product._id : (item.productId || item.product),
      name: product ? product.name : (item.name || "Product"),
      barcode: product ? product.barcode : (item.barcode || ""),
      price,
      quantity,
      total,
    });
  }

  const receiptNumber = `HLD-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const total = subtotal - discount;

  const sale = await Sale.create({
    clientId,
    receiptNumber,
    items: saleItems,
    subtotal,
    discount,
    total,
    paymentMethod: "cash",
    customerName: customerName || "",
    status: "held",
    cashier: cashierId,
  });

  return sale;
};

const resumeSale = async (clientId, saleId, updates) => {
  const sale = await Sale.findOne({ _id: saleId, clientId, status: "held" });
  if (!sale) throw new AppError("Held sale not found", 404);

  if (updates.items) sale.items = updates.items;
  if (updates.discount !== undefined) sale.discount = updates.discount;
  if (updates.customerName !== undefined) sale.customerName = updates.customerName;
  if (updates.paymentMethod) sale.paymentMethod = updates.paymentMethod;

  sale.subtotal = sale.items.reduce((sum, i) => sum + (i.total || i.price * i.quantity || 0), 0);
  sale.total = sale.subtotal - sale.discount;
  sale.status = "completed";

  await sale.save();
  return sale;
};

const getHeldSales = async (clientId) => {
  return Sale.find({ clientId, status: "held" }).sort("-createdAt").lean();
};

module.exports = { processSale, holdSale, resumeSale, getHeldSales };