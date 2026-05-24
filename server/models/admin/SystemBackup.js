const mongoose = require("mongoose");

const systemBackupSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      default: 0,
    },
    scope: {
      type: String,
      enum: ["full", "clients", "admin", "public"],
      default: "full",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SystemBackup", systemBackupSchema);