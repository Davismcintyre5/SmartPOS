const mongoose = require('mongoose');
const { SYSTEM_CURRENCIES, STORE_CURRENCIES } = require('../../utils/constants');

const downloadSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  type: {
    type: String,
    enum: ['windows', 'macos', 'linux', 'android', 'ios'],
    required: true
  },
  version: { type: String, required: true, trim: true },
  arch: {
    type: String,
    enum: ['x64', 'arm64', 'universal', 'other'],
    default: 'x64'
  },
  link: { type: String, required: true, trim: true },
  size: { type: Number, default: null },
  checksum: { type: String, default: null },
  minOS: { type: String, default: null },
  releaseNotes: { type: String, default: '' },
  enabled: { type: Boolean, default: true },
  position: { type: Number, default: 0 }
}, { _id: false, timestamps: true });

const adminSettingsSchema = new mongoose.Schema({
  _id: { type: String, default: 'global' },

  currencies: {
    system: { type: [String], default: SYSTEM_CURRENCIES },
    store: { type: [String], default: STORE_CURRENCIES },
    defaultSubscription: { type: String, default: 'USD' },
    defaultStore: { type: String, default: 'KES' }
  },

  tax: {
    defaultRate: { type: Number, default: 0 },
    label: { type: String, default: 'VAT' },
    inclusive: { type: Boolean, default: false }
  },

  branding: {
    platformName: { type: String, default: 'SmartPOS' },
    logoUrl: { type: String, default: null },
    supportEmail: { type: String, default: 'support@smartpos.com' },
    supportPhone: { type: String, default: '' },
    termsUrl: { type: String, default: '' },
    privacyUrl: { type: String, default: '' }
  },

  email: {
    fromName: { type: String, default: 'SmartPOS' },
    fromAddress: { type: String, default: '' },
    replyTo: { type: String, default: '' },
    templates: { type: mongoose.Schema.Types.Mixed, default: {} }
  },

  sms: {
    senderId: { type: String, default: 'SmartPOS' },
    enabled: { type: Boolean, default: true },
    dailyLimit: { type: Number, default: 1000 },
    templates: { type: mongoose.Schema.Types.Mixed, default: {} }
  },

  backups: {
    enabled: { type: Boolean, default: true },
    destination: { type: String, enum: ['cloudinary', 'local', 's3'], default: 'cloudinary' },
    retentionDays: { type: Number, default: 30 },
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'daily' },
    emailOnCompletion: { type: Boolean, default: false },
    emailRecipients: { type: [String], default: [] }
  },

  downloads: { type: [downloadSchema], default: [] },

  featureFlags: {
    apiAccess: { type: Boolean, default: true },
    loyalty: { type: Boolean, default: false },
    multiLocation: { type: Boolean, default: false },
    maintenanceMode: { type: Boolean, default: false }
  },

  security: {
    accessTokenMinutes: { type: Number, default: 15 },
    refreshTokenDays: { type: Number, default: 7 },
    minPasswordLength: { type: Number, default: 8 },
    require2FAForAdmin: { type: Boolean, default: false }
  },

  sync: {
    intervalSeconds: { type: Number, default: 30 },
    pullBatchSize: { type: Number, default: 200 },
    maxOutboxRetries: { type: Number, default: 10 }
  },

  onboarding: {
    defaultPlan: { type: String, default: 'trial' },
    requireEmailVerification: { type: Boolean, default: false },
    requireAdminApproval: { type: Boolean, default: true },
    trialDays: { type: Number, default: 14 },
    graceDays: { type: Number, default: 14 }
  },

  maintenanceMessage: {
    type: String,
    default: 'SmartPOS is under maintenance. Please try again shortly.'
  },

  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser', default: null }
}, { timestamps: true });

module.exports = mongoose.model('AdminSettings', adminSettingsSchema);