const mongoose = require('mongoose');

const processedItemSchema = new mongoose.Schema({
  _id: { type: String },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true, index: true },
  entity: { type: String, required: true },
  processedAt: { type: Date, default: Date.now }
}, { _id: false });

processedItemSchema.index({ tenantId: 1, processedAt: -1 });

module.exports = mongoose.model('ProcessedItem', processedItemSchema);