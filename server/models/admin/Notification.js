const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser', default: null, index: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String, default: null },
  read: { type: Boolean, default: false }
}, { timestamps: true });

notificationSchema.index({ adminId: 1, read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);