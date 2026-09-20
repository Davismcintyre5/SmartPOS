const mongoose = require('mongoose');
const { STORE_CURRENCIES } = require('../../utils/constants');

const settingsSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true, unique: true, index: true },

  // ── Store ─────────────────────────────────────────────
  storeName: { type: String, default: '' },
  logoUrl: { type: String, default: null },
  timezone: { type: String, default: 'Africa/Nairobi' },
  language: { type: String, default: 'en' },
  dateFormat: { type: String, default: 'YYYY-MM-DD' },
  timeFormat: { type: String, enum: ['12h', '24h'], default: '24h' },
  lowStockAlerts: { type: Boolean, default: true },
  lowStockThreshold: { type: Number, default: 5 },

  // ── Receipt ───────────────────────────────────────────
  receiptHeader: { type: String, default: '' },
  receiptFooter: { type: String, default: '' },
  receiptShowLogo: { type: Boolean, default: true },
  receiptShowTax: { type: Boolean, default: true },
  autoPrintReceipt: { type: Boolean, default: true },

  // ── Tax ───────────────────────────────────────────────
  taxRate: { type: Number, default: 0 },
  taxLabel: { type: String, default: 'VAT' },
  taxInclusive: { type: Boolean, default: false },

  // ── Discount ──────────────────────────────────────────
  discount: {
    globalEnabled: { type: Boolean, default: false },
    maxPercent: { type: Number, default: 50 },
    minPercent: { type: Number, default: 0 },
    allowCashierOverride: { type: Boolean, default: true },
    requireManagerApproval: { type: Boolean, default: false },
    managerApprovalThreshold: { type: Number, default: 30 }
  },

  // ── Currency ──────────────────────────────────────────
  currency: { type: String, enum: STORE_CURRENCIES, required: true, default: 'KES' },

  // ── Loyalty ───────────────────────────────────────────
  loyalty: {
    enabled: { type: Boolean, default: false },
    pointsPerUnit: { type: Number, default: 1 },
    unitValueCents: { type: Number, default: 10000 },
    redeemRate: { type: Number, default: 100 },
    redeemValueCents: { type: Number, default: 1000 },
    minRedeemPoints: { type: Number, default: 100 },
    expiryDays: { type: Number, default: 0 }
  },

  // ── AI ────────────────────────────────────────────────
  ai: {
    enabled: { type: Boolean, default: false },
    provider: { type: String, default: null },
    allowFileUpload: { type: Boolean, default: false },
    allowApiKeys: { type: Boolean, default: false }
  },

  // ── Sync ──────────────────────────────────────────────
  sync: {
    intervalSeconds: { type: Number, default: 30 },
    autoSyncOnReconnect: { type: Boolean, default: true }
  },

  // ── POS behavior ──────────────────────────────────────
  allowNegativeStock: { type: Boolean, default: false },
  requireCustomerForSale: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);