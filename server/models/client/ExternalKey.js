const mongoose = require('mongoose');

const externalKeySchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
    unique: true,
    index: true
  },
  keyHash: { type: String, required: true, unique: true },
  prefix: { type: String, required: true },
  lastUsedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('ExternalKey', externalKeySchema);