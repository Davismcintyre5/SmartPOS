const variants = {
  success: 'bg-[var(--success)]',
  error: 'bg-[var(--danger)]',
  info: 'bg-[var(--info)]',
  warning: 'bg-[var(--warning)]'
};

export default function Toast({ toasts = [], onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`${variants[t.type] || variants.info} text-[var(--accent-fg)] px-4 py-3 rounded-[var(--radius)] shadow-lg text-sm flex items-start gap-2 animate-in`}
        >
          <span className="flex-1">{t.message}</span>
          <button
            onClick={() => onDismiss(t.id)}
            className="text-current opacity-70 hover:opacity-100 text-lg leading-none"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}