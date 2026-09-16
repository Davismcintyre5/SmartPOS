const Customer = require('../../models/client/Customer');
const { success, created, paginated } = require('../../utils/response');
const { getPagination, buildPaginationMeta } = require('../../utils/pagination');
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');

const list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { search } = req.query;

  const query = { tenantId: req.tenant._id };
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
  }

  const [items, total] = await Promise.all([
    Customer.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Customer.countDocuments(query)
  ]);

  return paginated(res, items, buildPaginationMeta(total, page, limit));
});

const getOne = asyncHandler(async (req, res) => {
  const customer = await Customer.findOne({ _id: req.params.id, tenantId: req.tenant._id }).lean();
  if (!customer) throw ApiError.notFound('Customer not found');
  return success(res, customer, 'Customer');
});

const create = asyncHandler(async (req, res) => {
  const { name, email, phone } = req.body;
  if (!name) throw ApiError.badRequest('name required');

  const customer = await Customer.create({
    tenantId: req.tenant._id,
    name,
    email: email || null,
    phone: phone || null
  });

  return created(res, customer, 'Customer created');
});

const update = asyncHandler(async (req, res) => {
  const customer = await Customer.findOne({ _id: req.params.id, tenantId: req.tenant._id });
  if (!customer) throw ApiError.notFound('Customer not found');

  const { name, email, phone } = req.body;
  if (name) customer.name = name;
  if (email !== undefined) customer.email = email;
  if (phone !== undefined) customer.phone = phone;
  await customer.save();

  return success(res, customer, 'Customer updated');
});

const adjustLoyalty = asyncHandler(async (req, res) => {
  const { delta } = req.body;
  if (typeof delta !== 'number' || delta === 0) throw ApiError.badRequest('delta required');

  const customer = await Customer.findOne({ _id: req.params.id, tenantId: req.tenant._id });
  if (!customer) throw ApiError.notFound('Customer not found');

  customer.loyaltyPoints = Math.max(0, customer.loyaltyPoints + delta);
  await customer.save();

  return success(res, customer, 'Loyalty adjusted');
});

const search = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q) return success(res, [], 'No query');

  const items = await Customer.find({
    tenantId: req.tenant._id,
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
      { phone: { $regex: q, $options: 'i' } }
    ]
  }).limit(20).lean();

  return success(res, items, 'Search results');
});

module.exports = { list, getOne, create, update, adjustLoyalty, search };