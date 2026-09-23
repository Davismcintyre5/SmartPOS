function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function startOfWeek(d) {
  const x = new Date(d);
  const day = x.getDay();
  const diff = day === 0 ? 6 : day - 1;
  x.setDate(x.getDate() - diff);
  return startOfDay(x);
}

function startOfMonth(d) {
  const x = new Date(d);
  x.setDate(1);
  return startOfDay(x);
}

function startOfYear(d) {
  const x = new Date(d);
  x.setMonth(0, 1);
  return startOfDay(x);
}

function parseDate(value, endOfDayFlag = false) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return endOfDayFlag ? endOfDay(d) : startOfDay(d);
}

function resolveDateRange(query = {}) {
  const now = new Date();

  if (query.from || query.to) {
    const start = parseDate(query.from, false) || startOfDay(now);
    const end = parseDate(query.to, true) || endOfDay(now);
    return { start, end };
  }

  const period = String(query.period || 'today').toLowerCase();

  switch (period) {
    case 'today':
      return { start: startOfDay(now), end: endOfDay(now) };

    case 'yesterday': {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      return { start: startOfDay(y), end: endOfDay(y) };
    }

    case 'week':
      return { start: startOfWeek(now), end: endOfDay(now) };

    case 'last7':
    case 'last_7_days': {
      const s = new Date(now);
      s.setDate(s.getDate() - 6);
      return { start: startOfDay(s), end: endOfDay(now) };
    }

    case 'month':
      return { start: startOfMonth(now), end: endOfDay(now) };

    case 'last30':
    case 'last_30_days': {
      const s = new Date(now);
      s.setDate(s.getDate() - 29);
      return { start: startOfDay(s), end: endOfDay(now) };
    }

    case 'year':
      return { start: startOfYear(now), end: endOfDay(now) };

    case 'all':
      return { start: new Date(0), end: endOfDay(now) };

    default:
      return { start: startOfDay(now), end: endOfDay(now) };
  }
}

module.exports = {
  resolveDateRange,
  startOfDay,
  endOfDay,
  startOfWeek,
  startOfMonth,
  startOfYear,
};