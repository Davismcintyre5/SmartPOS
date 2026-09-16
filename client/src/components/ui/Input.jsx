export default function Input({
  label,
  error,
  hint,
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
      <input
        className={`w-full px-3 py-2 rounded-[var(--radius)] border bg-[var(--input-bg)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-colors ${
          error ? 'border-[var(--danger)]' : 'border-[var(--border-color)]'
        } ${className}`}
        {...rest}
      />
      {error && <p className="text-xs text-[var(--danger)] mt-1">{error}</p>}
      {!error && hint && <p className="text-xs text-[var(--text-muted)] mt-1">{hint}</p>}
    </div>
  );
}