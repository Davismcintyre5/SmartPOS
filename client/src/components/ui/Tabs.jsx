export default function Tabs({ tabs = [], active, onChange, className = '' }) {
  return (
    <div className={`flex gap-1 border-b border-[var(--border-color)] ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              isActive
                ? 'border-[var(--accent)] text-[var(--accent)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}