export default function FieldGroup({ title, description, children, className = '' }) {
  return (
    <div className={className}>
      {title && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
          {description && (
            <p className="text-xs text-[var(--text-muted)] mt-1">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  );
}