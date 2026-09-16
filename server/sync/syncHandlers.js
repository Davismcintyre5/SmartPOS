const Sale = require('../models/client/Sale');
const Product = require('../models/client/Product');
const StockMovement = require('../models/client/StockMovement');
const Settings = require('../models/client/Settings');
const { applyTax } = require('../utils/money');
const logger = require('../utils/logger');

async function saleCreate(tenantId, payload) {
  const existing = await Sale.findOne({ _id: payload.id, tenantId }).lean();
  if (existing) return;

  const settings = await Settings.findOne({ tenantId }).lean();
  const taxRate = settings?.taxRate ?? 0;
  const taxInclusive = settings?.taxInclusive ?? false;

  const saleItems = [];
  let subtotal = 0;
  let taxTotal = 0;

  for (const item of payload.items || []) {
    const product = await Product.findOne({ _id: item.productId, tenantId }).lean();
    const lineTotal = item.priceCents ? item.priceCents * item.qty : 0;
    const { tax } = applyTax(lineTotal, taxRate, taxInclusive);

    saleItems.push({
      productId: item.productId,
      productName: item.productName || product?.name || 'Unknown',
      qty: item.qty,
      priceCents: item.priceCents || 0,
      discountCents: item.discountCents || 0,
      taxCents: tax,
      totalCents: lineTotal
    });

    subtotal += lineTotal;
    taxTotal += tax;
  }

  await Sale.create({
    _id: payload.id,
    tenantId,
    userId: payload.userId || null,
    items: saleItems,
    subtotalCents: subtotal,
    taxCents: taxTotal,
    discountCents: payload.discountCents || 0,
    totalCents: payload.totalCents || subtotal + (taxInclusive ? 0 : taxTotal),
    currency: payload.currency || settings?.currency || 'KES',
    status: 'completed',
    paymentMethod: payload.paymentMethod || 'cash',
    clientCreatedAt: payload.createdAt ? new Date(payload.createdAt) : null,
    syncedAt: new Date()
  });
}

async function saleRefund(tenantId, payload) {
  const sale = await Sale.findOne({ _id: payload.id, tenantId });
  if (!sale) return;
  if (sale.status === 'refunded') return;

  for (const item of sale.items) {
    await Product.updateOne(
      { _id: item.productId, tenantId },
      { $inc: { stock: item.qty } }
    );
  }

  sale.status = 'refunded';
  await sale.save();
}

async function stockMovementCreate(tenantId, payload) {
  const existing = await StockMovement.findById(payload.id).lean();
  if (existing) return;

  await Product.updateOne(
    { _id: payload.productId, tenantId },
    { $inc: { stock: payload.delta } }
  );

  await StockMovement.create({
    _id: payload.id,
    tenantId,
    productId: payload.productId,
    delta: payload.delta,
    reason: payload.reason || 'adjustment',
    refId: payload.refId || null,
    userId: payload.userId || null
  });
}

async function productUpdate(tenantId, payload) {
  await Product.updateOne(
    { _id: payload.id, tenantId },
    { $set: payload.fields || {} }
  );
}

async function customerCreate(tenantId, payload) {
  const Customer = require('../models/client/Customer');
  const existing = await Customer.findById(payload.id).lean();
  if (existing) return;

  await Customer.create({
    _id: payload.id,
    tenantId,
    name: payload.name,
    email: payload.email || null,
    phone: payload.phone || null
  });
}

module.exports = {
  sale_create: saleCreate,
  sale_refund: saleRefund,
  stock_movement_create: stockMovementCreate,
  product_update: productUpdate,
  customer_create: customerCreate
};