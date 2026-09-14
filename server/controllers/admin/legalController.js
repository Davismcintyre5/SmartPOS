const Legal = require('../../models/admin/Legal');
const Client = require('../../models/admin/Client');
const { success, created } = require('../../utils/response');
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');

const list = asyncHandler(async (req, res) => {
  const { type, active } = req.query;
  const query = {};
  if (type) query.type = type;
  if (active !== undefined) query.active = active === 'true';

  const items = await Legal.find(query).sort({ createdAt: -1 }).lean();
  return success(res, items, 'Legal documents');
});

const getOne = asyncHandler(async (req, res) => {
  const doc = await Legal.findById(req.params.id).lean();
  if (!doc) throw ApiError.notFound('Legal document not found');
  return success(res, doc, 'Legal document');
});

const create = asyncHandler(async (req, res) => {
  const doc = await Legal.create(req.body);
  return created(res, doc, 'Legal document created');
});

const update = asyncHandler(async (req, res) => {
  const doc = await Legal.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!doc) throw ApiError.notFound('Legal document not found');
  return success(res, doc, 'Legal document updated');
});

const activate = asyncHandler(async (req, res) => {
  const doc = await Legal.findById(req.params.id);
  if (!doc) throw ApiError.notFound('Legal document not found');

  await Legal.updateMany({ type: doc.type }, { active: false });
  doc.active = true;
  await doc.save();

  return success(res, doc, 'Legal document activated');
});

const deactivate = asyncHandler(async (req, res) => {
  const doc = await Legal.findById(req.params.id);
  if (!doc) throw ApiError.notFound('Legal document not found');

  doc.active = false;
  await doc.save();

  return success(res, doc, 'Legal document deactivated');
});

const history = asyncHandler(async (req, res) => {
  const items = await Legal.find({ type: req.params.type }).sort({ createdAt: -1 }).lean();
  return success(res, items, 'Legal history');
});

const acceptances = asyncHandler(async (req, res) => {
  const items = await Client.find({
    $or: [
      { acceptedTermsVersion: { $exists: true, $ne: null } },
      { acceptedPrivacyVersion: { $exists: true, $ne: null } }
    ]
  }).select('name ownerEmail acceptedTermsVersion acceptedTermsAt acceptedPrivacyVersion acceptedPrivacyAt').lean();

  return success(res, items, 'Acceptances');
});

const getCurrent = asyncHandler(async (req, res) => {
  const doc = await Legal.findOne({ type: req.params.type, active: true }).lean();
  if (!doc) throw ApiError.notFound('No active version');
  return success(res, doc, 'Current legal document');
});

const getAll = asyncHandler(async (req, res) => {
  const items = await Legal.find({ active: true }).lean();
  return success(res, items, 'Active legal documents');
});

module.exports = {
  list,
  getOne,
  create,
  update,
  activate,
  deactivate,
  history,
  acceptances,
  getCurrent,
  getAll
};