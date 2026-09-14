const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

function now() {
  return dayjs().toDate();
}

function addDays(date, days) {
  return dayjs(date).add(days, 'day').toDate();
}

function addMonths(date, months) {
  return dayjs(date).add(months, 'month').toDate();
}

function startOfDay(date) {
  return dayjs(date).startOf('day').toDate();
}

function endOfDay(date) {
  return dayjs(date).endOf('day').toDate();
}

function isPast(date) {
  return dayjs(date).isBefore(dayjs());
}

function daysBetween(a, b) {
  return dayjs(b).diff(dayjs(a), 'day');
}

function formatDate(date, format = 'YYYY-MM-DD') {
  return dayjs(date).format(format);
}

function toISO(date) {
  return dayjs(date).toISOString();
}

module.exports = {
  now,
  addDays,
  addMonths,
  startOfDay,
  endOfDay,
  isPast,
  daysBetween,
  formatDate,
  toISO
};