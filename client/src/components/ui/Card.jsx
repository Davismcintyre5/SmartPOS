export default function Card({ className = '', children, ...rest }) {
  return (
    <div
      className={`bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[var(--radius)] p-6 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}