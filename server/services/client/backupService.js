const Backup = require("../../models/client/Backup");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");
const AppError = require("../../utils/AppError");

const createBackup = async (clientId, type = "manual") => {
  const timestamp = Date.now();
  const filename = `client_${clientId}_${timestamp}.gz`;
  const backupDir = path.join(__dirname, "..", "..", "backups", "clients");
  const filePath = path.join(backupDir, filename);

  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

  const collections = ["products", "sales", "customers", "users"];
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smartpos";

  return new Promise((resolve, reject) => {
    const cmd = `mongodump --uri="${uri}" --collection=${collections.join(",")} --query='{"clientId":"${clientId}"}' --archive="${filePath}" --gzip`;
    exec(cmd, async (error, stdout, stderr) => {
      if (error) {
        // Fallback: create a simple JSON dump
        const jsonDump = await createJsonBackup(clientId, filePath);
        const backup = await Backup.create({
          clientId,
          filename,
          path: filePath,
          size: fs.statSync(filePath).size,
          type,
          collections,
        });
        return resolve(backup);
      }
      const stats = fs.statSync(filePath);
      const backup = await Backup.create({
        clientId,
        filename,
        path: filePath,
        size: stats.size,
        type,
        collections,
      });
      resolve(backup);
    });
  });
};

const getBackups = async (clientId) => {
  return Backup.find({ clientId }).sort("-createdAt").lean();
};

module.exports = { createBackup, getBackups };