export default function Tooltip({ text, children, className = '' }) {
  return (
    <div className={`relative group inline-block ${className}`}>
      {children}
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-[var(--text-primary)] text-[var(--bg-primary)] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
        {text}
      </span>
    </div>
  );
}