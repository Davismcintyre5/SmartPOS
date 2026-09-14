const mongoose = require('mongoose');
const os = require('os');
const { getRedis } = require('../../config/redis');
const env = require('../../config/env');
const Client = require('../../models/admin/Client');
const Subscription = require('../../models/admin/Subscription');
const Payment = require('../../models/admin/Payment');
const Notification = require('../../models/admin/Notification');
const Product = require('../../models/client/Product');
const Category = require('../../models/client/Category');
const Sale = require('../../models/client/Sale');
const Customer = require('../../models/client/Customer');
const User = require('../../models/client/User');
const { success } = require('../../utils/response');
const asyncHandler = require('../../utils/asyncHandler');

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatBytes(bytes) {
  const mb = bytes / 1024 / 1024;
  if (mb > 1024) return `${(mb / 1024).toFixed(2)} GB`;
  return `${mb.toFixed(1)} MB`;
}

const health = asyncHandler(async (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = ['disconnected', 'connected', 'connecting', 'disconnecting'][dbState] || 'unknown';

  const redis = getRedis();
  const redisEnabled = env.REDIS_ENABLED;
  const redisStatus = redisEnabled ? (redis && redis.status === 'ready' ? 'connected' : 'disconnected') : 'disabled';

  const [clientsTotal, clientsActive, clientsTrials, subsTotal, subsRenewals, payTotal, payFailed, notifications] = await Promise.all([
    Client.countDocuments({}),
    Client.countDocuments({ status: 'active' }),
    Client.countDocuments({ status: 'trialing' }),
    Subscription.countDocuments({}),
    Client.countDocuments({ status: 'renewal' }),
    Payment.countDocuments({}),
    Payment.countDocuments({ status: 'failed' }),
    Notification.countDocuments({ read: false })
  ]);

  const [products, categories, sales, customers, staff] = await Promise.all([
    Product.countDocuments({}),
    Category.countDocuments({}),
    Sale.countDocuments({}),
    Customer.countDocuments({}),
    User.countDocuments({})
  ]);

  let collections = 0;
  let documents = 0;
  try {
    const cols = await mongoose.connection.db.listCollections().toArray();
    collections = cols.length;
    for (const c of cols) {
      documents += await mongoose.connection.db.collection(c.name).countDocuments();
    }
  } catch { /* ignore */ }

  const memory = process.memoryUsage();

  return success(res, {
    server: {
      status: 'up',
      node: process.version,
      platform: `${os.type()} ${os.release()}`,
      url: env.API_URL,
      uptime: formatUptime(process.uptime()),
      cpu: `${os.cpus().length} cores`,
      memory: formatBytes(memory.rss)
    },
    database: {
      status: dbStatus,
      type: 'MongoDB',
      host: mongoose.connection.host || '—',
      database: mongoose.connection.name || '—',
      collections,
      documents
    },
    redis: {
      status: redisStatus,
      host: env.REDIS_URL?.split('@').pop() || '—',
      enabled: redisEnabled
    },
    email: {
      status: env.HDM_API_KEY ? 'enabled' : 'disabled',
      provider: 'HDM Bridge',
      from: env.HDM_FROM_EMAIL,
      sender: env.HDM_FROM_NAME
    },
    sms: {
      status: env.BREVO_API_KEY ? 'enabled' : 'disabled',
      provider: 'Brevo',
      sender: env.BREVO_SENDER_ID
    },
    storage: {
      status: env.CLOUDINARY_CLOUD_NAME ? 'enabled' : 'disabled',
      type: 'Cloudinary',
      cloud: env.CLOUDINARY_CLOUD_NAME,
      backups: 'Cloudinary'
    },
    cors: {
      origins: env.CORS_ORIGINS
    },
    stats: {
      clients: { total: clientsTotal, active: clientsActive, trials: clientsTrials },
      subscriptions: { total: subsTotal, renewals: subsRenewals },
      payments: { total: payTotal, failed: payFailed },
      notifications,
      content: { products, categories, sales, customers, staff }
    },
    timestamp: new Date().toISOString()
  }, 'System health');
});

module.exports = { health };