// models/client/ReceiptSettings.js — add loyalty fields
const mongoose = require("mongoose");

const specificDiscountSchema = new mongoose.Schema({
  name: { type: String, default: "" },
  type: { type: String, enum: ["fixed", "percent", "buy_one_get_one", "buy_x_get_y"], default: "fixed" },
  value: { type: Number, default: 0 },
  productIds: [{ type: String }],
  buyQuantity: { type: Number, default: 2 },
  getQuantity: { type: Number, default: 1 },
  getProductId: { type: String, default: "" },
});

const receiptSettingsSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true, unique: true },
  receiptHeader: { type: String, default: "" },
  receiptFooter: { type: String, default: "Thank you for shopping with us!" },
  vatRate: { type: Number, default: 0 },
  vatEnabled: { type: Boolean, default: false },
  globalDiscountEnabled: { type: Boolean, default: false },
  globalDiscountName: { type: String, default: "Discount" },
  globalDiscountRate: { type: Number, default: 0 },
  specificDiscounts: [specificDiscountSchema],
  loyaltyEnabled: { type: Boolean, default: false },
  loyaltyPointsPerAmount: { type: Number, default: 100 },
  loyaltyLabel: { type: String, default: "Loyalty Points" },
}, { timestamps: true });

module.exports = mongoose.model("ReceiptSettings", receiptSettingsSchema);