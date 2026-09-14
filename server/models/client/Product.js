const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true, index: true },
  sku: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  barcode: { type: String, default: null },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  priceCents: { type: Number, required: true, default: 0 },
  costCents: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
  lowStockThreshold: { type: Number, default: 5 },
  taxRate: { type: Number, default: 0 },
  imageUrl: { type: String, default: null },
  active: { type: Boolean, default: true }
}, { timestamps: true });

productSchema.index({ tenantId: 1, sku: 1 }, { unique: true });
productSchema.index({ tenantId: 1, barcode: 1 });
productSchema.index({ tenantId: 1, updatedAt: -1 });

module.exports = mongoose.model('Product', productSchema);