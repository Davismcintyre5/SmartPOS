const mongoose = require('mongoose');
const { PLANS } = require('../../utils/constants');

const subscriptionSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true, index: true },
  plan: { type: String, enum: PLANS, required: true },
  cycle: { type: String, enum: ['monthly', 'yearly', 'one-time'], required: true },
  currency: { type: String, required: true },
  amountMinor: { type: Number, required: true },
  status: { type: String, enum: ['active', 'past_due', 'canceled', 'expired', 'perpetual'], required: true },
  stripeSubscriptionId: { type: String, default: null },
  periodStart: { type: Date, required: true },
  periodEnd: { type: Date, default: null },
  canceledAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);