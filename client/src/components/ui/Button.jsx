const variants = {
  primary: 'bg-[var(--accent)] text-[var(--accent-fg)] hover:bg-[var(--accent-hover)]',
  secondary: 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)]',
  danger: 'bg-[var(--danger)] text-[var(--accent-fg)] hover:bg-[var(--danger-hover)]',
  success: 'bg-[var(--success)] text-[var(--accent-fg)] hover:bg-[var(--success-hover)]',
  info: 'bg-[var(--info)] text-[var(--accent-fg)] hover:bg-[var(--info-hover)]',
  ghost: 'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)]'
};

const sizes = {
  sm: 'text-xs px-2.5 py-1.5',
  md: 'text-sm px-4 py-2',
  lg: 'text-base px-5 py-2.5'
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  children,
  ...rest
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-1.5 rounded-[var(--radius)] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {loading && (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}