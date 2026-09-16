export default function Skeleton({ className = '' }) {
  return (
    <div
      className={`animate-pulse bg-[var(--bg-tertiary)] rounded-[var(--radius)] ${className}`}
    />
  );
}