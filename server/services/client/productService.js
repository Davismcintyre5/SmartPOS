const Product = require("../../models/client/Product");
const AppError = require("../../utils/AppError");

const getProducts = async (clientId, filters = {}) => {
  const { search, category, page = 1, limit = 50 } = filters;
  const query = { clientId };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { barcode: { $regex: search, $options: "i" } },
    ];
  }
  if (category) query.category = category;

  const [products, total] = await Promise.all([
    Product.find(query)
      .sort("-createdAt")
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Product.countDocuments(query),
  ]);

  return { products, total, page: Number(page), pages: Math.ceil(total / limit) };
};

const getProductById = async (clientId, id) => {
  const product = await Product.findOne({ _id: id, clientId }).lean();
  if (!product) throw new AppError("Product not found", 404);
  return product;
};

const createProduct = async (clientId, data) => {
  return Product.create({ ...data, clientId });
};

const updateProduct = async (clientId, id, data) => {
  const product = await Product.findOneAndUpdate(
    { _id: id, clientId },
    data,
    { new: true, runValidators: true }
  );
  if (!product) throw new AppError("Product not found", 404);
  return product;
};

const deleteProduct = async (clientId, id) => {
  const product = await Product.findOneAndDelete({ _id: id, clientId });
  if (!product) throw new AppError("Product not found", 404);
  return product;
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };