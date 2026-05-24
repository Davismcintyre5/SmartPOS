const catchAsync = require("../../utils/catchAsync");
const { success } = require("../../utils/apiResponse");
const productService = require("../../services/client/productService");

// @desc    Get all products
// @route   GET /api/client/products
// @access  Private (Client)
const getProducts = catchAsync(async (req, res) => {
  const result = await productService.getProducts(req.clientId, req.query);
  success(res, result);
});

// @desc    Get single product
// @route   GET /api/client/products/:id
// @access  Private (Client)
const getProduct = catchAsync(async (req, res) => {
  const product = await productService.getProductById(req.clientId, req.params.id);
  success(res, product);
});

// @desc    Create product
// @route   POST /api/client/products
// @access  Private (Client)
const createProduct = catchAsync(async (req, res) => {
  const product = await productService.createProduct(req.clientId, req.body);
  success(res, product, "Product created", 201);
});

// @desc    Update product
// @route   PUT /api/client/products/:id
// @access  Private (Client)
const updateProduct = catchAsync(async (req, res) => {
  const product = await productService.updateProduct(req.clientId, req.params.id, req.body);
  success(res, product, "Product updated");
});

// @desc    Delete product
// @route   DELETE /api/client/products/:id
// @access  Private (Client)
const deleteProduct = catchAsync(async (req, res) => {
  await productService.deleteProduct(req.clientId, req.params.id);
  success(res, null, "Product deleted");
});

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };