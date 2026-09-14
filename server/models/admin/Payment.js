const mongoose = require('mongoose');
const { PAYMENT_METHODS, PAYMENT_STATUSES } = require('../../utils/constants');

const paymentSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    default: null,
    index: true
  },
  amountMinor: { type: Number, required: true },
  currency: { type: String, required: true },
  method: { type: String, enum: PAYMENT_METHODS, required: true },
  status: { type: String, enum: PAYMENT_STATUSES, default: 'pending' },
  reference: { type: String, default: null },
  mpesaPhone: { type: String, default: null },
  mpesaCode: { type: String, default: null },
  purpose: {
    type: String,
    enum: ['signup', 'renewal', 'ent', 'manual'],
    default: 'signup'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser',
    default: null
  },
  verifiedAt: { type: Date, default: null },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

paymentSchema.index({ status: 1 });
paymentSchema.index({ method: 1 });

module.exports = mongoose.model('Payment', paymentSchema);