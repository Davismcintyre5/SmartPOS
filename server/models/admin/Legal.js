const mongoose = require('mongoose');
const { LEGAL_TYPES } = require('../../utils/constants');

const legalSchema = new mongoose.Schema({
  type: { type: String, enum: LEGAL_TYPES, required: true, index: true },
  version: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  contentFormat: { type: String, enum: ['markdown', 'html'], default: 'markdown' },
  locale: { type: String, default: 'en' },
  effectiveFrom: { type: Date, default: Date.now },
  active: { type: Boolean, default: false },
  requiresAcceptance: { type: Boolean, default: true }
}, { timestamps: true });

legalSchema.index({ type: 1, active: 1 });

module.exports = mongoose.model('Legal', legalSchema);