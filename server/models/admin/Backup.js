const mongoose = require('mongoose');

const backupSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['database', 'full', 'incremental'],
    default: 'database'
  },
  status: {
    type: String,
    enum: ['running', 'success', 'failed'],
    default: 'running'
  },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date, default: null },
  durationMs: { type: Number, default: null },
  sizeBytes: { type: Number, default: null },
  destination: {
    type: String,
    enum: ['cloudinary', 'local', 's3'],
    default: 'cloudinary'
  },
  fileUrl: { type: String, default: null },
  publicId: { type: String, default: null },
  fileName: { type: String, default: null },
  collections: { type: [String], default: [] },
  counts: { type: mongoose.Schema.Types.Mixed, default: {} },
  documentCount: { type: Number, default: 0 },
  error: { type: String, default: null },
  triggeredBy: {
    type: String,
    enum: ['scheduler', 'admin', 'upload'],
    default: 'scheduler'
  },
  triggeredByAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser',
    default: null
  },
  emailedTo: { type: [String], default: [] },
  emailedAt: { type: Date, default: null },
  retentionUntil: { type: Date, default: null }
}, { timestamps: true });

backupSchema.index({ createdAt: -1 });
backupSchema.index({ status: 1 });
backupSchema.index({ retentionUntil: 1 });

module.exports = mongoose.model('Backup', backupSchema);