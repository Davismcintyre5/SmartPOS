export default function Textarea({
  label,
  error,
  hint,
  rows = 4,
  className = '',
  ...rest
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
          {label}
        </label>
      )}
      <textarea
        rows={rows}
        className={`w-full px-3 py-2 rounded-[var(--radius)] border bg-[var(--input-bg)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-colors resize-y ${
          error ? 'border-[var(--danger)]' : 'border-[var(--border-color)]'
        } ${className}`}
        {...rest}
      />
      {error && <p className="text-xs text-[var(--danger)] mt-1">{error}</p>}
      {!error && hint && <p className="text-xs text-[var(--text-muted)] mt-1">{hint}</p>}
    </div>
  );
}