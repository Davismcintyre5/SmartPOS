// models/client/Customer.js — add loyaltyCardNumber
const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true, index: true },
  name: { type: String, required: true, trim: true },
  phone: { type: String, trim: true },
  email: { type: String, lowercase: true, trim: true },
  loyaltyCardNumber: { type: String, trim: true, unique: true, sparse: true },
  loyaltyPoints: { type: Number, default: 0, min: 0 },
  totalSpent: { type: Number, default: 0 },
  visitCount: { type: Number, default: 0 },
}, { timestamps: true });

customerSchema.index({ clientId: 1, phone: 1 });
customerSchema.index({ clientId: 1, email: 1 });
customerSchema.index({ clientId: 1, loyaltyCardNumber: 1 });
customerSchema.index({ clientId: 1, name: "text", phone: "text", email: "text" });

module.exports = mongoose.model("Customer", customerSchema);