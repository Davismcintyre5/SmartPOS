// controllers/client/posController.js
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/AppError");
const { success } = require("../../utils/apiResponse");
const posService = require("../../services/client/posService");
const Product = require("../../models/client/Product");
const Sale = require("../../models/client/Sale");

// @desc    Lookup product by barcode
// @route   GET /api/client/pos/lookup/:barcode
// @access  Private (Client)
const lookupBarcode = catchAsync(async (req, res) => {
  const product = await Product.findOne({
    clientId: req.clientId,
    barcode: req.params.barcode,
  }).lean();
  if (!product) throw new AppError("Product not found", 404);
  success(res, product);
});

// @desc    Process a sale
// @route   POST /api/client/pos/sale
// @access  Private (Client)
const processSale = catchAsync(async (req, res) => {
  const sale = await posService.processSale(req.clientId, req.body, req.user.id);
  success(res, sale, "Sale completed", 201);
});

// @desc    Hold a sale
// @route   POST /api/client/pos/hold
// @access  Private (Client)
const holdSale = catchAsync(async (req, res) => {
  const sale = await posService.holdSale(req.clientId, req.body, req.user.id);
  success(res, sale, "Sale held", 201);
});

// @desc    Resume a held sale
// @route   PUT /api/client/pos/resume/:saleId
// @access  Private (Client)
const resumeSale = catchAsync(async (req, res) => {
  const sale = await posService.resumeSale(req.clientId, req.params.saleId, req.body);
  success(res, sale, "Sale resumed");
});

// @desc    Get all held sales
// @route   GET /api/client/pos/held
// @access  Private (Client)
const getHeldSales = catchAsync(async (req, res) => {
  const sales = await posService.getHeldSales(req.clientId);
  success(res, sales);
});

// @desc    Delete a held sale
// @route   DELETE /api/client/pos/held/:id
// @access  Private (Client)
const deleteHeldSale = catchAsync(async (req, res) => {
  const sale = await Sale.findOneAndDelete({
    _id: req.params.id,
    clientId: req.clientId,
    status: "held",
  });
  if (!sale) throw new AppError("Held sale not found", 404);
  success(res, null, "Held sale deleted");
});

module.exports = { lookupBarcode, processSale, holdSale, resumeSale, getHeldSales, deleteHeldSale };