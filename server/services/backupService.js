const mongoose = require('mongoose');
const Backup = require('../models/admin/Backup');
const cloudinaryService = require('./cloudinaryService');
const emailService = require('./emailService');
const logger = require('../utils/logger');
const { addDays } = require('../utils/date');

function allModels() {
  return Object.entries(mongoose.models).map(([name, Model]) => ({
    name: name.toLowerCase(),
    Model
  }));
}

async function create({ triggeredBy = 'scheduler', triggeredByAdmin = null } = {}) {
  const startedAt = new Date();
  const backup = await Backup.create({
    status: 'running',
    startedAt,
    triggeredBy,
    triggeredByAdmin
  });

  try {
    const models = allModels();
    const data = {};
    const counts = {};
    let total = 0;

    for (const { name, Model } of models) {
      const docs = await Model.find({}).lean();
      data[name] = docs;
      counts[name] = docs.length;
      total += docs.length;
    }

    const payload = {
      meta: {
        version: '1.0',
        app: 'SmartPOS',
        company: 'HDM',
        createdAt: new Date().toISOString(),
        createdBy: triggeredBy,
        nodeVersion: process.version,
        collections: models.map((m) => m.name),
        counts,
        documentCount: total
      },
      data
    };

    const buffer = Buffer.from(JSON.stringify(payload, null, 2), 'utf8');
    const fileName = `smartpos-backup-${Date.now()}.json`;

    const uploaded = await cloudinaryService.uploadRaw(
      buffer,
      'smartpos/backups',
      fileName.replace('.json', '')
    );

    const completedAt = new Date();
    const durationMs = completedAt - startedAt;
    const settings = require('../config/redis');

    backup.status = 'success';
    backup.completedAt = completedAt;
    backup.durationMs = durationMs;
    backup.sizeBytes = buffer.length;
    backup.destination = 'cloudinary';
    backup.fileUrl = uploaded.url;
    backup.publicId = uploaded.publicId;
    backup.fileName = fileName;
    backup.collections = models.map((m) => m.name);
    backup.counts = counts;
    backup.documentCount = total;
    backup.retentionUntil = addDays(completedAt, 30);
    await backup.save();

    logger.info({ backupId: backup._id, size: buffer.length, count: total }, 'Backup created');
    return backup;
  } catch (err) {
    backup.status = 'failed';
    backup.completedAt = new Date();
    backup.error = err.message;
    await backup.save();
    logger.error({ err, backupId: backup._id }, 'Backup failed');

    const settings = await require('../config/redis').getCache('admin:settings');
    const recipients = settings?.backups?.emailRecipients || [];
    if (recipients.length) {
      await emailService.sendBackupFailed(backup, recipients).catch(() => {});
    }

    throw err;
  }
}

async function list({ page = 1, limit = 20, status } = {}) {
  const query = {};
  if (status) query.status = status;

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Backup.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Backup.countDocuments(query)
  ]);

  return { items, total, page, limit };
}

async function getOne(id) {
  return Backup.findById(id).lean();
}

async function download(id) {
  const backup = await Backup.findById(id).lean();
  if (!backup) throw new Error('Backup not found');
  if (!backup.fileUrl) throw new Error('Backup file unavailable');

  const axios = require('axios');
  const { data } = await axios.get(backup.fileUrl, { responseType: 'arraybuffer' });

  return {
    fileName: backup.fileName,
    buffer: Buffer.from(data)
  };
}

async function sendToEmail(id, recipients) {
  const backup = await Backup.findById(id);
  if (!backup) throw new Error('Backup not found');

  await emailService.sendBackupComplete(backup, recipients);

  backup.emailedTo = recipients;
  backup.emailedAt = new Date();
  await backup.save();

  return { sent: recipients.length };
}

async function restore(id, mode = 'merge', collections = null) {
  const backup = await Backup.findById(id).lean();
  if (!backup) throw new Error('Backup not found');
  if (backup.status !== 'success') throw new Error('Cannot restore from failed backup');

  const { buffer } = await download(id);
  const payload = JSON.parse(buffer.toString('utf8'));
  return applyRestore(payload, mode, collections);
}

async function restoreFromFile(buffer, mode = 'merge', collections = null) {
  const payload = JSON.parse(buffer.toString('utf8'));
  if (payload?.meta?.app !== 'SmartPOS') {
    throw new Error('Invalid backup file: not a SmartPOS backup');
  }
  return applyRestore(payload, mode, collections);
}

async function applyRestore(payload, mode, collections) {
  const summary = { inserted: 0, updated: 0, skipped: 0, errors: [] };
  const targets = collections?.length ? collections : Object.keys(payload.data || {});

  for (const name of targets) {
    const docs = payload.data?.[name];
    if (!Array.isArray(docs)) continue;

    const Model = mongoose.models[Object.keys(mongoose.models).find(
      (m) => m.toLowerCase() === name
    )];

    if (!Model) {
      summary.errors.push({ collection: name, error: 'Model not found' });
      continue;
    }

    try {
      if (mode === 'replace') {
        await Model.deleteMany({});
      }

      for (const doc of docs) {
        try {
          await Model.replaceOne({ _id: doc._id }, doc, { upsert: true });
          summary.inserted += 1;
        } catch (err) {
          summary.skipped += 1;
          summary.errors.push({ collection: name, id: doc._id, error: err.message });
        }
      }
    } catch (err) {
      summary.errors.push({ collection: name, error: err.message });
    }
  }

  logger.info({ mode, summary }, 'Restore completed');
  return summary;
}

async function remove(id) {
  const backup = await Backup.findById(id);
  if (!backup) throw new Error('Backup not found');

  if (backup.publicId) {
    await cloudinaryService.destroy(backup.publicId, 'raw').catch(() => {});
  }

  await Backup.findByIdAndDelete(id);
  return { deleted: true };
}

async function cleanup() {
  const now = new Date();
  const expired = await Backup.find({ retentionUntil: { $lt: now } });

  let deleted = 0;
  for (const backup of expired) {
    try {
      await remove(backup._id);
      deleted += 1;
    } catch (err) {
      logger.error({ err, backupId: backup._id }, 'Cleanup failed for backup');
    }
  }

  logger.info({ deleted }, 'Backup cleanup completed');
  return { deleted };
}

module.exports = {
  create,
  list,
  getOne,
  download,
  sendToEmail,
  restore,
  restoreFromFile,
  remove,
  cleanup
};