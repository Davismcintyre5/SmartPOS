import { useEffect, useRef } from 'react';

export type ShortcutMap = Record<string, (e: KeyboardEvent) => void>;

interface Options {
  enabled?: boolean;
  preventDefault?: boolean;
  ignoreInInputs?: boolean;
}

export function useKeyboardShortcuts(
  map: ShortcutMap,
  { enabled = true, preventDefault = true, ignoreInInputs = true }: Options = {}
) {
  const mapRef = useRef(map);
  const optsRef = useRef({ preventDefault, ignoreInInputs });

  useEffect(() => {
    mapRef.current = map;
  }, [map]);

  useEffect(() => {
    optsRef.current = { preventDefault, ignoreInInputs };
  }, [preventDefault, ignoreInInputs]);

  useEffect(() => {
    if (!enabled) return;

    const isEditable = (el: EventTarget | null): boolean => {
      if (!(el instanceof HTMLElement)) return false;
      const tag = el.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
      return el.isContentEditable;
    };

    const handler = (e: KeyboardEvent) => {
      if (optsRef.current.ignoreInInputs && isEditable(e.target)) return;

      const parts: string[] = [];
      if (e.ctrlKey || e.metaKey) parts.push('mod');
      if (e.altKey) parts.push('alt');
      if (e.shiftKey) parts.push('shift');

      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      parts.push(key);

      const combo = parts.join('+');
      const fn = mapRef.current[combo] ?? mapRef.current[e.key];

      if (fn) {
        if (optsRef.current.preventDefault) e.preventDefault();
        fn(e);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [enabled]);
}