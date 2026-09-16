export default function SectionCard({ title, description, actions, className = '', children }) {
  return (
    <div className={`bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[var(--radius)] ${className}`}>
      {(title || actions) && (
        <div className="flex items-start justify-between px-6 py-4 border-b border-[var(--border-color)]">
          <div className="min-w-0">
            {title && <h2 className="text-base font-semibold text-[var(--text-primary)]">{title}</h2>}
            {description && <p className="text-xs text-[var(--text-muted)] mt-0.5">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}