const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true, index: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, default: null, lowercase: true },
  phone: { type: String, default: null },
  loyaltyPoints: { type: Number, default: 0 },
  totalSpentCents: { type: Number, default: 0 },
  lastVisitAt: { type: Date, default: null }
}, { timestamps: true });

customerSchema.index({ tenantId: 1, email: 1 });
customerSchema.index({ tenantId: 1, phone: 1 });

module.exports = mongoose.model('Customer', customerSchema);