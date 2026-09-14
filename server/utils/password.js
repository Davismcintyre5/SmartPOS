const argon2 = require('argon2');
const { getCache } = require('../config/redis');

let minLength = 8;

async function refreshMinLength() {
  try {
    const settings = await getCache('admin:settings');
    if (settings?.security?.minPasswordLength) {
      minLength = settings.security.minPasswordLength;
    }
  } catch { /* keep default */ }
}

refreshMinLength();
setInterval(refreshMinLength, 5 * 60 * 1000);

async function hashPassword(plain) {
  return argon2.hash(plain, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1
  });
}

async function comparePassword(plain, hash) {
  return argon2.verify(hash, plain);
}

function validatePasswordStrength(password) {
  if (!password || password.length < minLength) {
    return { valid: false, reason: `Password must be at least ${minLength} characters` };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, reason: 'Password must contain an uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, reason: 'Password must contain a lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, reason: 'Password must contain a number' };
  }
  return { valid: true };
}

function generateRandomPassword(length = 12) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

module.exports = {
  hashPassword,
  comparePassword,
  validatePasswordStrength,
  generateRandomPassword
};