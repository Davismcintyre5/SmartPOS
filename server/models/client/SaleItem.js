const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true, index: true },
  saleId: { type: String, required: true, index: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  qty: { type: Number, required: true, min: 1 },
  priceCents: { type: Number, required: true },
  discountCents: { type: Number, default: 0 },
  taxCents: { type: Number, default: 0 },
  totalCents: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('SaleItem', saleItemSchema);