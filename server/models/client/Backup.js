// models/client/Backup.js
const mongoose = require("mongoose");

const backupSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true, index: true },
    filename: { type: String, required: true },
    path: { type: String, required: true },
    size: { type: Number, default: 0 },
    type: { type: String, enum: ["manual", "scheduled"], default: "manual" },
    collections: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Backup", backupSchema);