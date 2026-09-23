const PREFIX = 'smartpos_';

function key(k: string): string {
  return `${PREFIX}${k}`;
}

export const storage = {
  get<T>(k: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key(k));
      if (raw === null) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },

  set<T>(k: string, value: T): void {
    try {
      localStorage.setItem(key(k), JSON.stringify(value));
    } catch {
      // ignore
    }
  },

  remove(k: string): void {
    try {
      localStorage.removeItem(key(k));
    } catch {
      // ignore
    }
  },

  clear(): void {
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && k.startsWith(PREFIX)) localStorage.removeItem(k);
      }
    } catch {
      // ignore
    }
  },
};