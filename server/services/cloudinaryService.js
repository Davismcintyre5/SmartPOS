const cloudinary = require('../config/cloudinary');
const logger = require('../utils/logger');

async function upload(buffer, folder, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto', ...options },
      (err, result) => {
        if (err) {
          logger.error({ err, folder }, 'Cloudinary upload failed');
          return reject(err);
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes
        });
      }
    );
    stream.end(buffer);
  });
}

async function uploadRaw(buffer, folder, publicId) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: 'raw',
        format: 'json'
      },
      (err, result) => {
        if (err) {
          logger.error({ err, folder }, 'Cloudinary raw upload failed');
          return reject(err);
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          bytes: result.bytes
        });
      }
    );
    stream.end(buffer);
  });
}

async function destroy(publicId, resourceType = 'image') {
  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    return result;
  } catch (err) {
    logger.error({ err, publicId }, 'Cloudinary destroy failed');
    throw err;
  }
}

async function uploadLogo(buffer, clientId) {
  return upload(buffer, `smartpos/clients/${clientId}/logo`, { public_id: 'logo' });
}

async function uploadProductImage(buffer, clientId, productId) {
  return upload(buffer, `smartpos/clients/${clientId}/products/${productId}`);
}

async function uploadAvatar(buffer, userId) {
  return upload(buffer, `smartpos/avatars/${userId}`, { public_id: 'avatar' });
}

module.exports = {
  upload,
  uploadRaw,
  destroy,
  uploadLogo,
  uploadProductImage,
  uploadAvatar
};