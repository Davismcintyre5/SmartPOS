const mongoose = require('mongoose');

const aiProviderSchema = new mongoose.Schema({
  key: {
    type: String,
    enum: ['hdm', 'deepseek', 'chatgpt', 'claude', 'gemini'],
    required: true
  },
  label: { type: String, required: true },
  baseUrl: { type: String, default: '' },
  apiKey: { type: String, default: '' },
  enabled: { type: Boolean, default: false }
}, { _id: false });

const aiConfigSchema = new mongoose.Schema({
  _id: { type: String, default: 'global' },

  providers: { type: [aiProviderSchema], default: [] },

  defaultProvider: { type: String, default: 'hdm' },

  features: {
    landingAi: { type: Boolean, default: false },
    clientAi: { type: Boolean, default: false },
    fileUpload: { type: Boolean, default: false },
    outwardApiKeys: { type: Boolean, default: false }
  },

  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser', default: null }
}, { timestamps: true });

module.exports = mongoose.model('AiConfig', aiConfigSchema);