import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import Card from '../../ui/Card';

export default function LowStockList({ products = [] }) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[var(--warning)]" />
          <h2 className="font-semibold text-[var(--text-primary)]">Low stock</h2>
        </div>
        <Link
          to="/inventory"
          className="text-xs font-medium text-[var(--accent)] hover:underline"
        >
          View all
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)] py-6 text-center">
          All products are well stocked.
        </p>
      ) : (
        <ul className="space-y-3">
          {products.map((p) => (
            <li key={p._id} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                  {p.name}
                </p>
                <p className="text-xs text-[var(--text-muted)] font-mono">
                  {p.sku || '—'}
                </p>
              </div>
              <span className="text-xs font-semibold text-[var(--danger)] shrink-0">
                {p.stock} left
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}