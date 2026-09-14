const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser', required: true, index: true },
  adminEmail: { type: String, required: true },
  action: { type: String, required: true, index: true },
  targetType: { type: String, default: null },
  targetId: { type: String, default: null },
  before: { type: mongoose.Schema.Types.Mixed, default: null },
  after: { type: mongoose.Schema.Types.Mixed, default: null },
  ip: { type: String, default: null },
  userAgent: { type: String, default: null }
}, { timestamps: true });

auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);