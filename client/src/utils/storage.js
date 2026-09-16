const PREFIX = 'smartpos:';

function key(k) {
  return `${PREFIX}${k}`;
}

function setItem(k, value) {
  try {
    localStorage.setItem(key(k), JSON.stringify(value));
  } catch {}
}

function getItem(k) {
  try {
    const raw = localStorage.getItem(key(k));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function removeItem(k) {
  try {
    localStorage.removeItem(key(k));
  } catch {}
}

function clear() {
  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const stored = localStorage.key(i);
      if (stored && stored.startsWith(PREFIX)) keys.push(stored);
    }
    keys.forEach((k) => localStorage.removeItem(k));
  } catch {}
}

export default { setItem, getItem, removeItem, clear, PREFIX };