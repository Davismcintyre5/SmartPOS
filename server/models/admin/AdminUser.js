const mongoose = require('mongoose');
const { ADMIN_ROLES } = require('../../utils/constants');

const adminUserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ADMIN_ROLES, default: 'admin' },
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String, default: null },
  lastLoginAt: { type: Date, default: null },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('AdminUser', adminUserSchema);