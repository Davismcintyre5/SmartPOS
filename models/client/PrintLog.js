const mongoose = require('mongoose');

const CLIENT_TYPES = ['desktop', 'web', 'mobile'];
const DOC_TYPES = ['sale_receipt', 'invoice_receipt', 'label', 'test'];

const schema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    deviceId: { type: String, default: null },
    clientType: { type: String, enum: CLIENT_TYPES, required: true },
    docType: { type: String, enum: DOC_TYPES, required: true },
    docId: { type: mongoose.Schema.Types.ObjectId, default: null },
    docNumber: { type: String, default: null },
    printerName: { type: String, default: null },
    success: { type: Boolean, default: false },
    error: { type: String, default: null },
    durationMs: { type: Number, default: 0 },
  },
  { timestamps: true }
);

schema.index({ tenantId: 1, createdAt: -1 });
schema.index({ tenantId: 1, success: 1, createdAt: -1 });

schema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('PrintLog', schema);