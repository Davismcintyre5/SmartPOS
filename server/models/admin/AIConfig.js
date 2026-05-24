const mongoose = require("mongoose");

const aiConfigSchema = new mongoose.Schema(
  {
    providers: [
      {
        name: {
          type: String,
          enum: ["hdm", "deepseek", "chatgpt", "claude", "gemini"],
        },
        enabled: { type: Boolean, default: false },
        apiKey: { type: String, default: "" },
      },
    ],
    globalDefault: {
      type: String,
      default: "hdm",
    },
    landingEnabled: { type: Boolean, default: true },
    clientEnabled: { type: Boolean, default: true },
    fileUploadEnabled: { type: Boolean, default: true },
    outwardKeyEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AIConfig", aiConfigSchema);