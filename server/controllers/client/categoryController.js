const Category = require('../../models/client/Category');
const Product = require('../../models/client/Product');
const { success, created } = require('../../utils/response');
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');

const list = asyncHandler(async (req, res) => {
  const items = await Category.find({ tenantId: req.tenant._id }).sort({ position: 1, name: 1 }).lean();
  return success(res, items, 'Categories');
});

const getOne = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ _id: req.params.id, tenantId: req.tenant._id }).lean();
  if (!category) throw ApiError.notFound('Category not found');
  return success(res, category, 'Category');
});

const create = asyncHandler(async (req, res) => {
  const { name, position } = req.body;
  if (!name) throw ApiError.badRequest('name required');

  const existing = await Category.findOne({ tenantId: req.tenant._id, name });
  if (existing) throw ApiError.conflict('Category already exists');

  const category = await Category.create({
    tenantId: req.tenant._id,
    name,
    position: position || 0
  });

  return created(res, category, 'Category created');
});

const update = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ _id: req.params.id, tenantId: req.tenant._id });
  if (!category) throw ApiError.notFound('Category not found');

  const { name, position } = req.body;
  if (name) category.name = name;
  if (position !== undefined) category.position = position;
  await category.save();

  return success(res, category, 'Category updated');
});

const remove = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ _id: req.params.id, tenantId: req.tenant._id });
  if (!category) throw ApiError.notFound('Category not found');

  const inUse = await Product.countDocuments({ tenantId: req.tenant._id, categoryId: category._id });
  if (inUse > 0) throw ApiError.badRequest(`${inUse} product(s) still use this category`);

  await Category.deleteOne({ _id: category._id });
  return success(res, null, 'Category deleted');
});

const reorder = asyncHandler(async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids)) throw ApiError.badRequest('ids array required');

  for (let i = 0; i < ids.length; i++) {
    await Category.updateOne(
      { _id: ids[i], tenantId: req.tenant._id },
      { position: i }
    );
  }

  return success(res, null, 'Categories reordered');
});

module.exports = { list, getOne, create, update, remove, reorder };