export const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

export const isUrl = (s: string) => {
  try {
    new URL(s);
    return true;
  } catch {
    return false;
  }
};

export const isNonEmpty = (s: string) => s.trim().length > 0;

export const minLength = (s: string, n: number) => s.length >= n;

export const maxLength = (s: string, n: number) => s.length <= n;

export const isNumeric = (s: string) => /^\d+$/.test(s);

export const isStrongPassword = (s: string, min = 8) => {
  if (s.length < min) return false;
  if (!/[a-zA-Z]/.test(s)) return false;
  if (!/\d/.test(s)) return false;
  return true;
};

export const isObjectId = (s: string) => /^[a-f\d]{24}$/i.test(s);