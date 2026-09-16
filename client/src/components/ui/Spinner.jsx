const sizes = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-10 h-10 border-3'
};

export default function Spinner({ size = 'md', className = '' }) {
  return (
    <span
      className={`inline-block rounded-full border-current border-t-transparent animate-spin text-[var(--accent)] ${sizes[size]} ${className}`}
    />
  );
}