const mongoose = require("mongoose");

const aiSettingsSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
      unique: true,
    },
    useGlobalAI: {
      type: Boolean,
      default: true,
    },
    provider: {
      type: String,
      enum: ["hdm", "deepseek", "chatgpt", "claude", "gemini"],
      default: "hdm",
    },
    apiKey: {
      type: String,
      default: "",
    },
    enabledFeatures: {
      posCommands: { type: Boolean, default: true },
      salesAnalytics: { type: Boolean, default: true },
      inventoryForecasting: { type: Boolean, default: true },
      proactiveAlerts: { type: Boolean, default: true },
      anomalyDetection: { type: Boolean, default: true },
      reportGeneration: { type: Boolean, default: true },
      semanticSearch: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AISettings", aiSettingsSchema);