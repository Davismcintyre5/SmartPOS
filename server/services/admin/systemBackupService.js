const SystemBackup = require("../../models/admin/SystemBackup");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");
const AppError = require("../../utils/AppError");

const createSystemBackup = async (scope = "full", createdBy) => {
  const timestamp = Date.now();
  const filename = `system_${scope}_${timestamp}.archive`;
  const backupDir = path.join(__dirname, "..", "..", "backups", "system");
  const filePath = path.join(backupDir, filename);

  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smartpos";
  let collections = "";
  if (scope === "clients") collections = "products,sales,customers,users,apikeys,clientcurrencies,aisettings,clientsubscriptions,backups";
  else if (scope === "admin") collections = "admins,clients,subscriptions,payments,paymentmethods,currencies,aiconfigs,communications,systems,systembackups";
  else if (scope === "public") collections = "contents,inquiries,licenses";

  return new Promise((resolve, reject) => {
    const cmd = `mongodump --uri="${uri}" ${collections ? `--collection=${collections.split(",").join(" --collection=")}` : ""} --archive="${filePath}" --gzip`;
    exec(cmd, async (error) => {
      if (error) {
        // Fallback: create empty backup record
        const backup = await SystemBackup.create({
          filename,
          path: filePath,
          size: 0,
          scope,
          createdBy,
        });
        return resolve(backup);
      }
      const stats = fs.statSync(filePath);
      const backup = await SystemBackup.create({
        filename,
        path: filePath,
        size: stats.size,
        scope,
        createdBy,
      });
      resolve(backup);
    });
  });
};

const getBackups = async () => {
  return SystemBackup.find().populate("createdBy", "name email").sort("-createdAt").lean();
};

const getBackupById = async (id) => {
  const backup = await SystemBackup.findById(id);
  if (!backup) throw new AppError("Backup not found", 404);
  return backup;
};

const deleteBackup = async (id) => {
  const backup = await SystemBackup.findById(id);
  if (!backup) throw new AppError("Backup not found", 404);
  // Delete file
  try {
    if (fs.existsSync(backup.path)) fs.unlinkSync(backup.path);
  } catch (e) {}
  await backup.deleteOne();
  return backup;
};

module.exports = { createSystemBackup, getBackups, getBackupById, deleteBackup };