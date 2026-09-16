const mongoose = require('mongoose');

const pendingRegistrationSchema = new mongoose.Schema({
  _id: { type: String },
  ownerName: { type: String, required: true },
  ownerEmail: { type: String, required: true, lowercase: true, index: true },
  ownerPhone: { type: String, default: '' },
  passwordHash: { type: String, required: true },
  storeName: { type: String, required: true },
  country: { type: String, default: '' },
  subscriptionCurrency: { type: String, required: true },
  storeCurrency: { type: String, required: true },
  plan: { type: String, required: true },
  paymentMethod: { type: String, default: null },
  status: {
    type: String,
    enum: ['pending', 'paid', 'expired', 'abandoned'],
    default: 'pending'
  },
  expiresAt: { type: Date, required: true }
}, { timestamps: true });

pendingRegistrationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('PendingRegistration', pendingRegistrationSchema);