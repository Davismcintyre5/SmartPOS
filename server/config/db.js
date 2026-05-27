const mongoose = require("mongoose");
const env = require("./env");
const logger = require("./logger");

const connectDB = async () => {
  try {
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    if (env.NODE_ENV === "production") {
      options.ssl = true;
      options.retryWrites = true;
      options.w = "majority";
    }

    const conn = await mongoose.connect(env.MONGO_URI, options);
    logger.info(`MongoDB connected: ${conn.connection.host}`);

    mongoose.connection.on("error", (err) => {
      logger.error("MongoDB connection error", { error: err.message });
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected — attempting reconnect...");
    });
  } catch (err) {
    logger.error("MongoDB initial connection failed", { error: err.message });
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;