require("./dnsSet");

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");

const env = require("./config/env");
const logger = require("./config/logger");
const connectDB = require("./config/db");
const { configureCloudinary } = require("./config/cloudinary");
const errorHandler = require("./middleware/common/errorHandler");
const requestLogger = require("./middleware/common/requestLogger");
const routes = require("./routes/index");

const app = express();

// Ensure required directories exist
["logs", "uploads", "backups/system", "backups/clients"].forEach((dir) => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
});

// Middleware
app.use(cors({ origin: env.CORS_ORIGINS, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(requestLogger);

// Static
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Root
app.get("/", (req, res) => {
  res.json({
    name: "SmartPOS API",
    version: "1.0.0",
    status: "running",
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// API info
app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "SmartPOS API",
    endpoints: {
      public: "/api/public",
      client: "/api/client",
      admin: "/api/admin",
    },
    docs: "https://docs.smartpos.com",
  });
});

// Health check
app.get("/health", (req, res) => {
  const mongoose = require("mongoose");
  const dbState = mongoose.connection.readyState;
  const states = { 0: "disconnected", 1: "connected", 2: "connecting", 3: "disconnecting" };

  res.json({
    success: true,
    server: "healthy",
    database: states[dbState] || "unknown",
    uptime: Math.floor(process.uptime()),
    memory: Math.round(process.memoryUsage().rss / 1024 / 1024),
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api", routes);

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use(errorHandler);

// Start server
const start = async () => {
  try {
    await connectDB();
    configureCloudinary();

    const server = app.listen(env.PORT, () => {
      console.log("");
      console.log("  ┌─────────────────────────────────────────┐");
      console.log("  │           🚀 SmartPOS Server             │");
      console.log("  ├─────────────────────────────────────────┤");
      console.log(`  │  Environment : ${env.NODE_ENV.padEnd(27)}│`);
      console.log(`  │  Port        : ${String(env.PORT).padEnd(27)}│`);
      console.log(`  │  MongoDB     : ${(env.MONGO_URI.includes("@") ? env.MONGO_URI.split("@")[1].split("/")[0] : env.MONGO_URI).padEnd(27)}│`);
      console.log(`  │  CORS        : ${env.CORS_ORIGINS[0].padEnd(27)}│`);
      console.log(`  │  AI          : ${(env.HDM_AI_API_KEY ? "Configured" : "Not set").padEnd(27)}│`);
      console.log(`  │  Stripe      : ${(env.STRIPE_SECRET_KEY ? "Configured" : "Not set").padEnd(27)}│`);
      console.log(`  │  M-Pesa      : ${(env.MPESA_CONSUMER_KEY ? "Configured" : "Not set").padEnd(27)}│`);
      console.log(`  │  PayPal      : ${(env.PAYPAL_CLIENT_ID ? "Configured" : "Not set").padEnd(27)}│`);
      console.log(`  │  Brevo       : ${(env.BREVO_API_KEY ? "Configured" : "Not set").padEnd(27)}│`);
      console.log(`  │  Cloudinary  : ${(env.CLOUDINARY_CLOUD_NAME ? "Configured" : "Not set").padEnd(27)}│`);
      console.log("  └─────────────────────────────────────────┘");
      console.log("");

      logger.info(`Server started on port ${env.PORT} in ${env.NODE_ENV} mode`);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`\n  ⚠️  ${signal} received. Shutting down...`);
      logger.warn(`${signal} received — shutting down gracefully`);

      server.close(async () => {
        console.log("  🔌 HTTP server closed");
        try {
          const mongoose = require("mongoose");
          await mongoose.connection.close(false);
          console.log("  🗄️  MongoDB disconnected");
        } catch (err) {
          console.error("  ❌ MongoDB disconnect error:", err.message);
        }
        console.log("  👋 Goodbye\n");
        process.exit(0);
      });

      setTimeout(() => {
        console.error("  ❌ Forced shutdown after 10s");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));

    // Never crash on uncaught errors
    process.on("uncaughtException", (err) => {
      logger.error("Uncaught Exception", { message: err.message, stack: err.stack });
      console.error("  ❌ Uncaught Exception:", err.message);
    });

    process.on("unhandledRejection", (reason) => {
      logger.error("Unhandled Rejection", { reason });
      console.error("  ❌ Unhandled Rejection:", reason);
    });
  } catch (err) {
    logger.error("Failed to start server", { error: err.message });
    console.error("  ❌ Startup failed:", err.message);
    process.exit(1);
  }
};

start();