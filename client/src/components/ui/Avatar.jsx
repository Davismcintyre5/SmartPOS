const sizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base'
};

function initials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0].toUpperCase())
    .join('');
}

export default function Avatar({ name, src, size = 'md', className = '' }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizes[size]} rounded-full object-cover ${className}`}
      />
    );
  }
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-fg)] font-semibold ${sizes[size]} ${className}`}
    >
      {initials(name)}
    </span>
  );
}