// controllers/client/saleController.js
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/AppError");
const { success } = require("../../utils/apiResponse");
const saleService = require("../../services/client/saleService");
const Sale = require("../../models/client/Sale");

// @desc    Get all sales
// @route   GET /api/client/sales
// @access  Private (Client)
const getSales = catchAsync(async (req, res) => {
  const result = await saleService.getSales(req.clientId, req.query);
  success(res, result);
});

// @desc    Get single sale
// @route   GET /api/client/sales/:id
// @access  Private (Client)
const getSale = catchAsync(async (req, res) => {
  const sale = await saleService.getSaleById(req.clientId, req.params.id);
  success(res, sale);
});

// @desc    Process refund
// @route   POST /api/client/sales/:id/refund
// @access  Private (Client)
const refundSale = catchAsync(async (req, res) => {
  const sale = await saleService.refundSale(req.clientId, req.params.id, req.body.reason);
  success(res, sale, "Refund processed");
});

// @desc    Delete a sale
// @route   DELETE /api/client/sales/:id
// @access  Private (Owner/Manager)
const deleteSale = catchAsync(async (req, res) => {
  const sale = await Sale.findOneAndDelete({ _id: req.params.id, clientId: req.clientId });
  if (!sale) throw new AppError("Sale not found", 404);
  success(res, null, "Sale deleted");
});

module.exports = { getSales, getSale, refundSale, deleteSale };