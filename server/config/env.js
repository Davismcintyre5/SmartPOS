require('dotenv').config();

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,
  APP_URL: process.env.APP_URL || 'http://localhost:3000',
  ADMIN_URL: process.env.ADMIN_URL || 'http://localhost:3001',
 ADMIN_BASE_PATH: process.env.ADMIN_BASE_PATH || '',
  API_URL: process.env.API_URL || 'http://localhost:5000',

  MONGODB_URI: process.env.MONGODB_URI,

  REDIS_ENABLED: process.env.REDIS_ENABLED === 'true',
  REDIS_URL: process.env.REDIS_URL,

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES || '15m',
  JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES || '7d',

  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,

  PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
  PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET,
  PAYPAL_MODE: process.env.PAYPAL_MODE || 'sandbox',

  MPESA_ENV: process.env.MPESA_ENV || 'sandbox',
  MPESA_CONSUMER_KEY: process.env.MPESA_CONSUMER_KEY,
  MPESA_CONSUMER_SECRET: process.env.MPESA_CONSUMER_SECRET,
  MPESA_SHORTCODE: process.env.MPESA_SHORTCODE,
  MPESA_PASSKEY: process.env.MPESA_PASSKEY,
  MPESA_CALLBACK_URL: process.env.MPESA_CALLBACK_URL,

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

  HDM_API_KEY: process.env.HDM_API_KEY,
  HDM_API_URL: process.env.HDM_API_URL,
  HDM_FROM_EMAIL: process.env.HDM_FROM_EMAIL,
  HDM_FROM_NAME: process.env.HDM_FROM_NAME,

  BREVO_API_KEY: process.env.BREVO_API_KEY,
  BREVO_SENDER_ID: process.env.BREVO_SENDER_ID,

  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,

  LOG_LEVEL: process.env.LOG_LEVEL || 'info',

  CORS_ORIGINS: (process.env.CORS_ORIGINS || '').split(',').filter(Boolean)
};

module.exports = env;