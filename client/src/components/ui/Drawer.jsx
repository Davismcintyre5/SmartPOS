import { useEffect } from 'react';

export default function Drawer({ open, onClose, title, side = 'right', children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const posClass = side === 'right' ? 'right-0' : 'left-0';

  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`}>
      <div
        className={`absolute inset-0 bg-[var(--overlay)] transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <div
        className={`absolute top-0 bottom-0 ${posClass} w-full max-w-md bg-[var(--card-bg)] border-l border-[var(--border-color)] transform transition-transform ${
          open ? 'translate-x-0' : side === 'right' ? 'translate-x-full' : '-translate-x-full'
        }`}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)]">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h2>
            <button
              onClick={onClose}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xl leading-none"
            >
              ×
            </button>
          </div>
        )}
        <div className="p-6 overflow-y-auto h-[calc(100%-4rem)]">{children}</div>
      </div>
    </div>
  );
}