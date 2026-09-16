export default function Select({
  label,
  error,
  options = [],
  placeholder,
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
      <select
        className={`w-full px-3 py-2 rounded-[var(--radius)] border bg-[var(--input-bg)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-colors ${
          error ? 'border-[var(--danger)]' : 'border-[var(--border-color)]'
        } ${className}`}
        {...rest}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-[var(--danger)] mt-1">{error}</p>}
    </div>
  );
}