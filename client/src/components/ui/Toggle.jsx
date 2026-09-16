export default function Toggle({
  label,
  checked = false,
  onChange,
  disabled = false,
  className = ''
}) {
  return (
    <label className={`inline-flex items-center gap-3 cursor-pointer ${disabled ? 'opacity-50' : ''} ${className}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          checked ? 'bg-[var(--accent)]' : 'bg-[var(--bg-tertiary)]'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
      {label && <span className="text-sm text-[var(--text-primary)]">{label}</span>}
    </label>
  );
}