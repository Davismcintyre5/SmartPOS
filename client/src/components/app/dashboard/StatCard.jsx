export default function StatCard({ icon: Icon, label, value, accent = false }) {
  return (
    <div className={`bg-[var(--card-bg)] border rounded-[var(--radius)] p-5 ${accent ? 'border-[var(--accent)]' : 'border-[var(--border-color)]'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-[var(--text-secondary)]">{label}</p>
          <p className={`text-xl md:text-2xl font-bold mt-2 truncate ${accent ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'}`}>
            {value}
          </p>
        </div>
        {Icon && (
          <div className={`w-9 h-9 rounded-[var(--radius)] flex items-center justify-center shrink-0 ${accent ? 'bg-[var(--accent)]/10' : 'bg-[var(--bg-tertiary)]'}`}>
            <Icon className={`w-4 h-4 ${accent ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'}`} />
          </div>
        )}
      </div>
    </div>
  );
}