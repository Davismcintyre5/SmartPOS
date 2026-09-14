const mongoose = require('mongoose');
const env = require('./env');

let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  mongoose.set('strictQuery', true);

  await mongoose.connect(env.MONGODB_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000
  });

  isConnected = true;

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    console.warn('MongoDB disconnected');
  });
}

async function disconnectDB() {
  if (!isConnected) return;
  await mongoose.connection.close();
  isConnected = false;
}

module.exports = { connectDB, disconnectDB };