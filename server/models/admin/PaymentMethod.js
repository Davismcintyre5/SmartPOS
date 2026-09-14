const mongoose = require('mongoose');
const { PAYMENT_METHODS } = require('../../utils/constants');

const paymentMethodSchema = new mongoose.Schema({
  _id: { type: String, enum: PAYMENT_METHODS },
  name: { type: String, required: true },
  provider: { type: String, required: true },
  type: { type: String, enum: ['automatic', 'manual'], required: true },
  enabled: { type: Boolean, default: false },
  status: { type: String, enum: ['connected', 'not_configured', 'error'], default: 'not_configured' },
  supportedCurrencies: { type: [String], default: [] },
  config: { type: mongoose.Schema.Types.Mixed, default: {} },
  position: { type: Number, default: 0 }
}, { timestamps: true, _id: false });

module.exports = mongoose.model('PaymentMethod', paymentMethodSchema);