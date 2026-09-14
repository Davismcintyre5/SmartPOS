const mongoose = require('mongoose');
const { TENANT_ROLES } = require('../../utils/constants');

const userSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
    index: true
  },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, default: '' },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: TENANT_ROLES, default: 'cashier' },
  pin: { type: String, default: null },
  active: { type: Boolean, default: true },
  lastLoginAt: { type: Date, default: null },
  resetToken: { type: String, default: null },
  resetTokenExpiry: { type: Date, default: null }
}, { timestamps: true });

userSchema.index({ tenantId: 1, email: 1 }, { unique: true });
userSchema.index({ resetToken: 1 }, { sparse: true });

module.exports = mongoose.model('User', userSchema);