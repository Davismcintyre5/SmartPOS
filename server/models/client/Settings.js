const mongoose = require('mongoose');
const { STORE_CURRENCIES } = require('../../utils/constants');

const settingsSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true, unique: true, index: true },
  receiptHeader: { type: String, default: '' },
  receiptFooter: { type: String, default: '' },
  receiptShowLogo: { type: Boolean, default: true },
  receiptShowTax: { type: Boolean, default: true },
  autoPrintReceipt: { type: Boolean, default: true },
  taxRate: { type: Number, default: 0 },
  taxLabel: { type: String, default: 'VAT' },
  taxInclusive: { type: Boolean, default: false },
  currency: { type: String, enum: STORE_CURRENCIES, required: true },
  timezone: { type: String, default: 'Africa/Nairobi' },
  dateFormat: { type: String, default: 'YYYY-MM-DD' },
  timeFormat: { type: String, enum: ['12h', '24h'], default: '24h' },
  language: { type: String, default: 'en' },
  lowStockAlerts: { type: Boolean, default: true },
  lowStockThreshold: { type: Number, default: 5 },
  allowNegativeStock: { type: Boolean, default: false },
  requireCustomerForSale: { type: Boolean, default: false },
  syncIntervalSeconds: { type: Number, default: 30 }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);