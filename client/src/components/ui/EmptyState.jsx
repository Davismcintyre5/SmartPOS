export default function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && <Icon className="w-12 h-12 text-[var(--text-muted)] mb-4" />}
      <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
      {message && <p className="text-sm text-[var(--text-muted)] mt-1 max-w-sm">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}