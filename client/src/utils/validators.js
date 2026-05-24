export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const isValidPhone = (phone) => /^\+?\d{7,15}$/.test(phone);
export const isNotEmpty = (val) => val?.toString().trim().length > 0;
export const isPositiveNumber = (val) => !isNaN(val) && Number(val) > 0;
export const isValidLicenseKey = (key) => /^SMART-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/.test(key);