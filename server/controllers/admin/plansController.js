const Plan = require('../../models/admin/Plan');
const stripeService = require('../../services/stripeService');
const { success, paginated } = require('../../utils/response');
const { getPagination, buildPaginationMeta } = require('../../utils/pagination');
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');

const list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { active } = req.query;

  const query = {};
  if (active !== undefined) query.active = active === 'true';

  const [items, total] = await Promise.all([
    Plan.find(query).sort({ position: 1 }).skip(skip).limit(limit).lean(),
    Plan.countDocuments(query)
  ]);

  return paginated(res, items, buildPaginationMeta(total, page, limit));
});

const getOne = asyncHandler(async (req, res) => {
  const plan = await Plan.findById(req.params.id).lean();
  if (!plan) throw ApiError.notFound('Plan not found');
  return success(res, plan, 'Plan');
});

const update = asyncHandler(async (req, res) => {
  const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!plan) throw ApiError.notFound('Plan not found');
  return success(res, plan, 'Plan updated');
});

const toggle = asyncHandler(async (req, res) => {
  const plan = await Plan.findById(req.params.id);
  if (!plan) throw ApiError.notFound('Plan not found');

  plan.active = !plan.active;
  await plan.save();

  return success(res, plan, `Plan ${plan.active ? 'enabled' : 'disabled'}`);
});

const syncStripePrices = asyncHandler(async (req, res) => {
  const plan = await Plan.findById(req.params.id).lean();
  if (!plan) throw ApiError.notFound('Plan not found');

  const results = {};

  for (const currency of Object.keys(plan.prices || {})) {
    const priceId = await stripeService.getPriceId(plan._id, plan.cycle, currency);
    if (priceId) results[currency] = priceId;
  }

  return success(res, results, 'Stripe price IDs synced');
});

module.exports = { list, getOne, update, toggle, syncStripePrices };