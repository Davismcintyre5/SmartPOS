const cors = require('cors');
const env = require('../../config/env');

const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (env.CORS_ORIGINS.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
});

module.exports = corsMiddleware;