// config/env.js
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const env = {
  // Server
  PORT: parseInt(process.env.PORT, 10) || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",

  // URLs
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",
  ADMIN_URL: process.env.ADMIN_URL || "http://localhost:3001",
  SERVER_URL: process.env.SERVER_URL || "http://localhost:5000",

  // MongoDB
  MONGO_URI: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smartpos",

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || "smartpos_dev_secret",
  JWT_EXPIRE: process.env.JWT_EXPIRE || "7d",

  // CORS
  CORS_ORIGINS: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim())
    : ["http://localhost:3000", "http://localhost:3001"],

  // AI
  HDM_AI_BASE_URL: process.env.HDM_AI_BASE_URL || "https://hdmai-server.onrender.com/api/v1",
  HDM_AI_API_KEY: process.env.HDM_AI_API_KEY || "",

  // Stripe
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || "",

  // M-Pesa
  MPESA_CONSUMER_KEY: process.env.MPESA_CONSUMER_KEY || "",
  MPESA_CONSUMER_SECRET: process.env.MPESA_CONSUMER_SECRET || "",
  MPESA_PASSKEY: process.env.MPESA_PASSKEY || "",
  MPESA_SHORTCODE: process.env.MPESA_SHORTCODE || "",
  MPESA_ENVIRONMENT: process.env.MPESA_ENVIRONMENT || "sandbox",

  // PayPal
  PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID || "",
  PAYPAL_SECRET: process.env.PAYPAL_SECRET || "",
  PAYPAL_ENVIRONMENT: process.env.PAYPAL_ENVIRONMENT || "sandbox",

  // Brevo
  BREVO_API_KEY: process.env.BREVO_API_KEY || "",
  BREVO_SENDER_EMAIL: process.env.BREVO_SENDER_EMAIL || "noreply@smartpos.com",

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",
};

// Validate critical variables in production
if (env.NODE_ENV === "production") {
  const required = ["MONGO_URI", "JWT_SECRET"];
  const missing = required.filter((key) => !env[key] || env[key].includes("dev_secret") || env[key].includes("127.0.0.1"));

  if (missing.length > 0) {
    console.error(`❌ Missing or insecure environment variables: ${missing.join(", ")}`);
    process.exit(1);
  }
}

module.exports = env;