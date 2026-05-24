const mongoose = require("mongoose");
const env = require("./env");
const logger = require("./logger");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info(`MongoDB connected: ${conn.connection.host}`);

    mongoose.connection.on("error", (err) => {
      logger.error("MongoDB connection error", { error: err.message });
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected — attempting reconnect...");
    });

    mongoose.connection.on("reconnected", () => {
      logger.info("MongoDB reconnected");
    });
  } catch (err) {
    logger.error("MongoDB initial connection failed", { error: err.message });
    // Retry after 5 seconds instead of crashing
    logger.info("Retrying in 5 seconds...");
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;