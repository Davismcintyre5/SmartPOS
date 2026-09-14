const mongoose = require('mongoose');
const { STOCK_REASONS } = require('../../utils/constants');

const stockMovementSchema = new mongoose.Schema({
  _id: { type: String },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true, index: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  delta: { type: Number, required: true },
  reason: { type: String, enum: STOCK_REASONS, required: true },
  refId: { type: String, default: null },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true, _id: false });

stockMovementSchema.index({ tenantId: 1, productId: 1, createdAt: -1 });

module.exports = mongoose.model('StockMovement', stockMovementSchema);