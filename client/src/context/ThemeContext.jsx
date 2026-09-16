import { createContext, useContext, useEffect, useState } from 'react';
import storage from '../utils/storage';

const ThemeContext = createContext(null);

const DEFAULTS = {
  mode: 'system',
  accent: 'blue',
  radius: 'md',
  density: 'comfortable'
};

const STORAGE_KEY = 'theme';

function resolveMode(mode) {
  if (mode === 'system') {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return mode;
}

function applyTheme(theme) {
  const resolved = resolveMode(theme.mode);
  const root = document.documentElement;
  root.setAttribute('data-theme', resolved);
  root.setAttribute('data-accent', theme.accent);
  root.setAttribute('data-radius', theme.radius);
  root.setAttribute('data-density', theme.density);
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = storage.getItem(STORAGE_KEY);
    return { ...DEFAULTS, ...(saved || {}) };
  });

  const [resolvedMode, setResolvedMode] = useState(() => resolveMode(theme.mode));

  useEffect(() => {
    applyTheme(theme);
    storage.setItem(STORAGE_KEY, theme);
    setResolvedMode(resolveMode(theme.mode));
  }, [theme]);

  useEffect(() => {
    if (theme.mode !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const resolved = mq.matches ? 'dark' : 'light';
      setResolvedMode(resolved);
      document.documentElement.setAttribute('data-theme', resolved);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme.mode]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key !== `smartpos:${STORAGE_KEY}`) return;
      try {
        const next = JSON.parse(e.newValue);
        if (next) setTheme({ ...DEFAULTS, ...next });
      } catch {}
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const setMode = (mode) => setTheme((t) => ({ ...t, mode }));
  const setAccent = (accent) => setTheme((t) => ({ ...t, accent }));
  const setRadius = (radius) => setTheme((t) => ({ ...t, radius }));
  const setDensity = (density) => setTheme((t) => ({ ...t, density }));
  const toggleMode = () =>
    setTheme((t) => ({ ...t, mode: resolveMode(t.mode) === 'dark' ? 'light' : 'dark' }));
  const reset = () => setTheme({ ...DEFAULTS });

  return (
    <ThemeContext.Provider
      value={{
        mode: theme.mode,
        resolvedMode,
        accent: theme.accent,
        radius: theme.radius,
        density: theme.density,
        setMode,
        setAccent,
        setRadius,
        setDensity,
        toggleMode,
        reset
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}