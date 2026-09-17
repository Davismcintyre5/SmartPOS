const mongoose = require('mongoose');
const { PLANS, PLAN_STATUSES, SYSTEM_CURRENCIES, STORE_CURRENCIES } = require('../../utils/constants');

const clientSettingsSchema = new mongoose.Schema({
  receiptHeader: { type: String, default: '' },
  receiptFooter: { type: String, default: '' },
  receiptShowLogo: { type: Boolean, default: true },
  receiptShowTax: { type: Boolean, default: true },
  autoPrintReceipt: { type: Boolean, default: true },
  taxRate: { type: Number, default: 0 },
  taxLabel: { type: String, default: 'VAT' },
  taxInclusive: { type: Boolean, default: false },
  timezone: { type: String, default: 'Africa/Nairobi' },
  dateFormat: { type: String, default: 'YYYY-MM-DD' },
  timeFormat: { type: String, enum: ['12h', '24h'], default: '24h' },
  language: { type: String, default: 'en' },
  lowStockAlerts: { type: Boolean, default: true },
  lowStockThreshold: { type: Number, default: 5 },
  allowNegativeStock: { type: Boolean, default: false },
  requireCustomerForSale: { type: Boolean, default: false },
  syncIntervalSeconds: { type: Number, default: 30 }
}, { _id: false });

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  ownerName: { type: String, required: true },
  ownerEmail: { type: String, required: true, lowercase: true, trim: true },
  ownerPhone: { type: String, default: '' },
  country: { type: String, default: '' },

  licenseKey: { type: String, default: null, index: true },

  subscriptionCurrency: { type: String, enum: SYSTEM_CURRENCIES, default: 'USD' },
  storeCurrency: { type: String, enum: STORE_CURRENCIES, default: 'KES' },

  plan: { type: String, enum: PLANS, default: 'trial' },
  status: { type: String, enum: PLAN_STATUSES, default: 'trialing' },
  periodStart: { type: Date, default: Date.now },
  periodEnd: { type: Date, default: null },
  autoRenew: { type: Boolean, default: false },

  stripeCustomerId: { type: String, default: null },
  stripeSubscriptionId: { type: String, default: null },

  approvedAt: { type: Date, default: null },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser', default: null },
  rejectedAt: { type: Date, default: null },
  rejectionReason: { type: String, default: null },

  acceptedTermsVersion: { type: String, default: null },
  acceptedTermsAt: { type: Date, default: null },
  acceptedPrivacyVersion: { type: String, default: null },
  acceptedPrivacyAt: { type: Date, default: null },

  logoUrl: { type: String, default: null },

  reminderLog: {
    trial7Sent: { type: Boolean, default: false },
    trial1Sent: { type: Boolean, default: false },
    renewal7Sent: { type: Boolean, default: false },
    renewal1Sent: { type: Boolean, default: false }
  },

  settings: { type: clientSettingsSchema, default: () => ({}) }
}, { timestamps: true });

clientSchema.index({ status: 1 });
clientSchema.index({ plan: 1 });
clientSchema.index({ periodEnd: 1 });

module.exports = mongoose.model('Client', clientSchema);