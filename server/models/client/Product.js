// models/client/Product.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true, index: true },
    name: { type: String, required: true, trim: true },
    barcode: { type: String, trim: true, default: "" },
    price: { type: Number, required: true, min: 0 },
    cost: { type: Number, min: 0, default: 0 },
    stock: { type: Number, default: 0, min: 0 },
    category: { type: String, trim: true, default: "" },
    lowStockThreshold: { type: Number, default: 10 },
  },
  { timestamps: true }
);

productSchema.index({ clientId: 1, name: "text", barcode: "text" });

module.exports = mongoose.model("Product", productSchema);