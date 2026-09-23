export const capitalize = (s: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

export const titleCase = (s: string) =>
  s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

export const truncate = (s: string, len: number, suffix = '…') =>
  s.length > len ? s.slice(0, len) + suffix : s;

export const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');

export const maskEmail = (email: string) => {
  const [user, domain] = email.split('@');
  if (!domain) return '[redacted]';
  return `${user.slice(0, 2)}***@${domain}`;
};

export const maskPhone = (phone: string) => {
  if (phone.length < 6) return '[redacted]';
  return `${phone.slice(0, 4)}***${phone.slice(-2)}`;
};

export const bytes = (n: number) => {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(2)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`;
};

export const number = (n: number, locale = 'en-KE') =>
  new Intl.NumberFormat(locale).format(n);

export const percent = (n: number, digits = 1) => `${n.toFixed(digits)}%`;

export const randomId = () =>
  Math.random().toString(36).slice(2) + Date.now().toString(36);

export const pluralize = (count: number, singular: string, plural?: string) =>
  `${count} ${count === 1 ? singular : plural || singular + 's'}`;