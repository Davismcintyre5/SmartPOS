const mongoose = require('mongoose');

const syncLogSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true, index: true },
  direction: { type: String, enum: ['push', 'pull'], required: true },
  itemCount: { type: Number, default: 0 },
  successCount: { type: Number, default: 0 },
  failCount: { type: Number, default: 0 },
  durationMs: { type: Number, default: 0 },
  deviceId: { type: String, default: null }
}, { timestamps: true });

syncLogSchema.index({ tenantId: 1, createdAt: -1 });

module.exports = mongoose.model('SyncLog', syncLogSchema);