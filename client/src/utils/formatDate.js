export const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-KE", { year: "numeric", month: "short", day: "numeric" });
};

export const formatDateTime = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleString("en-KE", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
};

export const timeAgo = (date) => {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(date);
};