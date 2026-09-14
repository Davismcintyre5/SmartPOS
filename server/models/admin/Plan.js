const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  _id: { type: String },
  name: { type: String, required: true },
  code: { type: String, required: true },
  description: { type: String, default: '' },
  billingType: { type: String, enum: ['free', 'recurring', 'one-time'], required: true },
  cycle: { type: String, enum: ['none', 'monthly', 'yearly'], default: 'none' },
  durationDays: { type: Number, default: null },
  perpetual: { type: Boolean, default: false },
  prices: {
    KES: { type: Number, default: 0 },
    USD: { type: Number, default: 0 },
    EUR: { type: Number, default: 0 },
    GBP: { type: Number, default: 0 }
  },
  stripePriceIds: { type: mongoose.Schema.Types.Mixed, default: {} },
  active: { type: Boolean, default: true },
  position: { type: Number, default: 0 }
}, { timestamps: true, _id: false });

module.exports = mongoose.model('Plan', planSchema);