export const formatDate = (d: string | Date, style: 'short' | 'long' = 'short') => {
  const date = typeof d === 'string' ? new Date(d) : d;
  if (style === 'long') {
    return date.toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  return date.toLocaleDateString('en-KE');
};

export const formatTime = (d: string | Date) => {
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });
};

export const formatDateTime = (d: string | Date) => {
  const date = typeof d === 'string' ? new Date(d) : d;
  return `${formatDate(date)} ${formatTime(date)}`;
};

export const relativeTime = (d: string | Date) => {
  const date = typeof d === 'string' ? new Date(d) : d;
  const diff = Date.now() - date.getTime();
  const s = Math.floor(diff / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const days = Math.floor(h / 24);

  if (s < 60) return 'just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (days < 30) return `${days}d ago`;
  return formatDate(date);
};

export const toISO = (d: string | Date) => {
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toISOString();
};

export const isToday = (d: string | Date) => {
  const date = typeof d === 'string' ? new Date(d) : d;
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
};

export const startOfDay = (d: string | Date) => {
  const date = typeof d === 'string' ? new Date(d) : new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
};

export const endOfDay = (d: string | Date) => {
  const date = typeof d === 'string' ? new Date(d) : new Date(d);
  date.setHours(23, 59, 59, 999);
  return date;
};

export const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};