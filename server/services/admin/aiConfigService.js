const AIConfig = require("../../models/admin/AIConfig");

const getConfig = async () => {
  let config = await AIConfig.findOne().lean();
  if (!config) config = await AIConfig.create({});
  return config;
};

const updateConfig = async (data) => {
  const config = await AIConfig.findOneAndUpdate({}, data, { upsert: true, new: true, runValidators: true });
  return config;
};

module.exports = { getConfig, updateConfig };