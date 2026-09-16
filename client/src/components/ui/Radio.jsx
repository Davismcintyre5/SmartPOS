export default function Radio({ label, name, value, checked, onChange, disabled = false, className = '' }) {
  return (
    <label className={`inline-flex items-center gap-2 cursor-pointer ${disabled ? 'opacity-50' : ''} ${className}`}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="w-4 h-4 text-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)] cursor-pointer"
      />
      {label && <span className="text-sm text-[var(--text-primary)]">{label}</span>}
    </label>
  );
}