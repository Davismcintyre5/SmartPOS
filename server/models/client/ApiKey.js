const mongoose = require("mongoose");
const crypto = require("crypto");

const apiKeySchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    key: {
      type: String,
      required: true,
      unique: true,
    },
    maskedKey: {
      type: String,
    },
    lastUsed: Date,
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

apiKeySchema.pre("validate", function (next) {
  if (!this.key) {
    this.key = `sk-${crypto.randomBytes(24).toString("hex")}`;
  }
  if (!this.maskedKey) {
    this.maskedKey = `${this.key.slice(0, 8)}...${this.key.slice(-4)}`;
  }
  next();
});

module.exports = mongoose.model("ApiKey", apiKeySchema);