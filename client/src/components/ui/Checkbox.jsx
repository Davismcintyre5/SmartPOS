export default function Checkbox({
  label,
  checked = false,
  onChange,
  disabled = false,
  className = '',
  ...rest
}) {
  return (
    <label className={`inline-flex items-center gap-2 cursor-pointer ${disabled ? 'opacity-50' : ''} ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="w-4 h-4 rounded border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)] cursor-pointer"
        {...rest}
      />
      {label && <span className="text-sm text-[var(--text-primary)]">{label}</span>}
    </label>
  );
}