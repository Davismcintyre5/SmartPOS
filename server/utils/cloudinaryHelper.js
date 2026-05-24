const { cloudinary } = require("../config/cloudinary");
const logger = require("../config/logger");

const uploadImage = async (filePath, folder = "smartpos") => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: "auto",
    });
    logger.info("Image uploaded to Cloudinary", { public_id: result.public_id });
    return { success: true, url: result.secure_url, public_id: result.public_id };
  } catch (err) {
    logger.error("Cloudinary upload failed", { error: err.message });
    return { success: false, message: "Image upload failed" };
  }
};

const deleteImage = async (public_id) => {
  try {
    await cloudinary.uploader.destroy(public_id);
    logger.info("Cloudinary image deleted", { public_id });
    return { success: true };
  } catch (err) {
    logger.error("Cloudinary delete failed", { error: err.message });
    return { success: false };
  }
};

module.exports = { uploadImage, deleteImage };