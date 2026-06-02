/**
 * Format a date string or Date object into a readable format
 * @param {string|Date} date - The date to format
 * @param {string} format - Optional format pattern (default: 'MMM DD, YYYY')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'MMM DD, YYYY') => {
  if (!date) return '';
  
  const d = new Date(date);
  
  // Check if date is valid
  if (isNaN(d.getTime())) return '';
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fullMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  const day = d.getDate();
  const month = d.getMonth();
  const year = d.getFullYear();
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  
  switch(format) {
    case 'DD/MM/YYYY':
      return `${day.toString().padStart(2, '0')}/${(month + 1).toString().padStart(2, '0')}/${year}`;
    case 'MM/DD/YYYY':
      return `${(month + 1).toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    case 'MMMM DD, YYYY':
      return `${fullMonths[month]} ${day}, ${year}`;
    case 'MMM DD, YYYY':
      return `${months[month]} ${day}, ${year}`;
    case 'DD MMM YYYY':
      return `${day} ${months[month]} ${year}`;
    case 'hh:mm A':
      return `${hours12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    case 'MMM DD, YYYY hh:mm A':
      return `${months[month]} ${day}, ${year} ${hours12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    default:
      return `${months[month]} ${day}, ${year}`;
  }
};

/**
 * Format a date as relative time (e.g., "2 hours ago", "yesterday")
 * @param {string|Date} date - The date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const now = new Date();
  const diffInSeconds = Math.floor((now - d) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  } else if (diffInDays === 1) {
    return 'yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else {
    return formatDate(date, 'MMM DD, YYYY');
  }
};

/**
 * Format a date as "Today", "Yesterday", or the actual date
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatSmartDate = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const compareDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  
  if (compareDate.getTime() === today.getTime()) {
    return 'Today';
  } else if (compareDate.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  } else {
    return formatDate(date, 'MMM DD, YYYY');
  }
};

// Default export for convenience
export default {
  formatDate,
  formatRelativeTime,
  formatSmartDate
};