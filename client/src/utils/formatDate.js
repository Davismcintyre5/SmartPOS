import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export function formatDate(date) {
  if (!date) return '';
  return dayjs(date).format('YYYY-MM-DD');
}

export function formatDateTime(date) {
  if (!date) return '';
  return dayjs(date).format('YYYY-MM-DD HH:mm');
}

export function formatTime(date) {
  if (!date) return '';
  return dayjs(date).format('HH:mm');
}

export function formatRelative(date) {
  if (!date) return '';
  return dayjs(date).fromNow();
}

export function formatDayName(date) {
  if (!date) return '';
  return dayjs(date).format('dddd');
}

export default {
  formatDate,
  formatDateTime,
  formatTime,
  formatRelative,
  formatDayName
};