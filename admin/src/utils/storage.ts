const memoryStore = new Map<string, string>();
let useMemory = false;

try {
  window.localStorage.setItem('__test__', '1');
  window.localStorage.removeItem('__test__');
} catch {
  useMemory = true;
}

const store = {
  get(key: string): string | null {
    if (useMemory) return memoryStore.get(key) ?? null;
    return window.localStorage.getItem(key);
  },
  set(key: string, value: string): void {
    if (useMemory) {
      memoryStore.set(key, value);
      return;
    }
    window.localStorage.setItem(key, value);
  },
  remove(key: string): void {
    if (useMemory) {
      memoryStore.delete(key);
      return;
    }
    window.localStorage.removeItem(key);
  },
  clear(): void {
    if (useMemory) {
      memoryStore.clear();
      return;
    }
    window.localStorage.clear();
  },
};

export const storage = {
  get: (key: string) => store.get(key),
  set: (key: string, value: string) => store.set(key, value),
  remove: (key: string) => store.remove(key),
  clear: () => store.clear(),
  getJson: <T>(key: string): T | null => {
    const raw = store.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
  setJson: (key: string, value: unknown) => store.set(key, JSON.stringify(value)),
};