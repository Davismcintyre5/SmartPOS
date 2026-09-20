const crypto = require('crypto');
const ExternalKey = require('../../models/client/ExternalKey');
const Client = require('../../models/admin/Client');
const ApiError = require('../../utils/ApiError');

function hashKey(raw) {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

async function externalKeyAuth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw ApiError.unauthorized('API key required');
    }

    const raw = header.slice(7).trim();
    if (!raw.startsWith('sp_live_')) {
      throw ApiError.unauthorized('Invalid API key');
    }

    const prefix = raw.slice(0, 16);
    const keyHash = hashKey(raw);

    const record = await ExternalKey.findOne({ prefix, keyHash });
    if (!record) throw ApiError.unauthorized('Invalid API key');

    const tenant = await Client.findById(record.tenantId).lean();
    if (!tenant) throw ApiError.unauthorized('Tenant not found');

    ExternalKey.updateOne({ _id: record._id }, { lastUsedAt: new Date() }).catch(() => {});

    req.tenant = tenant;
    req.externalKey = record;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = externalKeyAuth;