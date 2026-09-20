import { formatMoney } from '../../../utils/formatMoney';

export default function SalesChart({ chart = [], currency = 'KES' }) {
  if (!chart.length) {
    return <p className="text-sm text-[var(--text-muted)] text-center py-8">No data yet.</p>;
  }

  const max = Math.max(...chart.map((c) => c.totalCents), 1);
  const totalWeek = chart.reduce((s, c) => s + c.totalCents, 0);

  return (
    <>
      <div className="flex items-end justify-between gap-2 h-32 mb-2">
        {chart.map((d) => {
          const height = max > 0 ? (d.totalCents / max) * 100 : 0;
          return (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group">
              <div className="relative w-full h-full flex items-end">
                <div
                  className="w-full rounded-t-[4px] bg-[var(--accent)] transition-all group-hover:opacity-80"
                  style={{ height: `${Math.max(height, 2)}%` }}
                  title={formatMoney(d.totalCents, currency)}
                />
              </div>
              <span className="text-[10px] text-[var(--text-muted)] whitespace-nowrap">
                {new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-[var(--border-color)] text-xs">
        <span className="text-[var(--text-muted)]">7-day total</span>
        <span className="font-semibold text-[var(--text-primary)]">
          {formatMoney(totalWeek, currency)}
        </span>
      </div>
    </>
  );
}