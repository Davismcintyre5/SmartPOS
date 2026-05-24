// models/client/Sale.js
const mongoose = require("mongoose");

const saleItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    name: String,
    barcode: String,
    price: Number,
    quantity: Number,
    total: Number,
  },
  { _id: false }
);

const saleSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true, index: true },
    receiptNumber: { type: String, required: true },
    items: [saleItemSchema],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    vatRate: { type: Number, default: 0 },
    vatAmount: { type: Number, default: 0 },
    amountPaid: { type: Number, default: 0 },
    changeAmount: { type: Number, default: 0 },
    paymentMethod: { type: String, enum: ["cash", "mpesa", "card"], required: true },
    customerName: { type: String, default: "" },
    cashier: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["completed", "refunded", "held"], default: "completed" },
    refundReason: String,
    refundedAt: Date,
  },
  { timestamps: true }
);

saleSchema.index({ clientId: 1, receiptNumber: 1 });
saleSchema.index({ clientId: 1, createdAt: -1 });
saleSchema.index({ clientId: 1, paymentMethod: 1 });
saleSchema.index({ clientId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model("Sale", saleSchema);