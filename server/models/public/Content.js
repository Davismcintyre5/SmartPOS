const mongoose = require("mongoose");

const contentSchema = new mongoose.Schema(
  {
    section: {
      type: String,
      unique: true,
      required: true,
      enum: [
        "hero", "about", "features", "facts", "faqs", "help",
        "pricing", "contact", "terms", "privacy", "cookies",
        "refund", "disclaimer", "acceptable-use",
        "data-processing", "sla", "gdpr", "security",
      ],
    },
    title: { type: String, default: "" },
    body: { type: String, default: "" },
    mediaUrl: { type: String, default: "" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Content", contentSchema);