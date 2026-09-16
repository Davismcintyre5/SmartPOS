export function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

export function isEmail(value) {
  if (!value) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isPhone(value) {
  if (!value) return false;
  const digits = String(value).replace(/\D/g, '');
  return digits.length >= 9 && digits.length <= 15;
}

export function isStrongPassword(password) {
  if (!password || password.length < 8) {
    return { valid: false, reason: 'Password must be at least 8 characters' };
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

export function required(value, name = 'Field') {
  if (isEmpty(value)) return `${name} is required`;
  return null;
}

export function minLength(value, n, name = 'Field') {
  if (!value || String(value).length < n) return `${name} must be at least ${n} characters`;
  return null;
}

export function maxLength(value, n, name = 'Field') {
  if (value && String(value).length > n) return `${name} must be at most ${n} characters`;
  return null;
}

export default {
  isEmpty,
  isEmail,
  isPhone,
  isStrongPassword,
  required,
  minLength,
  maxLength
};