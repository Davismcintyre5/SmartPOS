import { useEffect, useRef, useState } from 'react';

export default function Dropdown({ trigger, children, align = 'right' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen((v) => !v)}>{trigger}</div>
      {open && (
        <div
          className={`absolute top-full mt-2 z-40 min-w-[180px] bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[var(--radius)] shadow-lg py-1 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({ children, onClick, danger = false }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2 text-sm transition-colors ${
        danger
          ? 'text-[var(--danger)] hover:bg-[var(--danger-soft)]'
          : 'text-[var(--text-primary)] hover:bg-[var(--sidebar-hover)]'
      }`}
    >
      {children}
    </button>
  );
}