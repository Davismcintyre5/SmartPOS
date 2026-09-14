const mongoose = require('mongoose');
const { PAYMENT_METHODS, SALE_STATUSES } = require('../../utils/constants');

const saleItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  qty: { type: Number, required: true, min: 1 },
  priceCents: { type: Number, required: true },
  discountCents: { type: Number, default: 0 },
  taxCents: { type: Number, default: 0 },
  totalCents: { type: Number, required: true }
}, { _id: false });

const saleSchema = new mongoose.Schema({
  _id: { type: String },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  items: { type: [saleItemSchema], required: true },
  subtotalCents: { type: Number, required: true },
  taxCents: { type: Number, default: 0 },
  discountCents: { type: Number, default: 0 },
  totalCents: { type: Number, required: true },
  currency: { type: String, required: true },
  status: { type: String, enum: SALE_STATUSES, default: 'completed' },
  paymentMethod: { type: String, enum: PAYMENT_METHODS, default: 'stripe' },
  clientCreatedAt: { type: Date, default: null },
  syncedAt: { type: Date, default: null }
}, { timestamps: true, _id: false });

saleSchema.index({ tenantId: 1, createdAt: -1 });
saleSchema.index({ tenantId: 1, status: 1 });

module.exports = mongoose.model('Sale', saleSchema);