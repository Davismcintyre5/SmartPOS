const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true, index: true },
  name: { type: String, required: true, trim: true },
  position: { type: Number, default: 0 }
}, { timestamps: true });

categorySchema.index({ tenantId: 1, name: 1 }, { unique: true });
categorySchema.index({ tenantId: 1, updatedAt: -1 });

module.exports = mongoose.model('Category', categorySchema);