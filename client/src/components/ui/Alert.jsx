const variants = {
  info: 'bg-[var(--info-soft)] text-[var(--info)] border-[var(--info)]',
  success: 'bg-[var(--success-soft)] text-[var(--success)] border-[var(--success)]',
  warning: 'bg-[var(--warning-soft)] text-[var(--warning)] border-[var(--warning)]',
  error: 'bg-[var(--danger-soft)] text-[var(--danger)] border-[var(--danger)]'
};

export default function Alert({ variant = 'info', title, children, className = '' }) {
  return (
    <div className={`border rounded-[var(--radius)] px-4 py-3 text-sm ${variants[variant]} ${className}`}>
      {title && <p className="font-semibold mb-0.5">{title}</p>}
      {children}
    </div>
  );
}