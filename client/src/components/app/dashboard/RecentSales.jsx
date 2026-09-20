import { Link } from 'react-router-dom';
import { ArrowRight, Plus } from 'lucide-react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import { formatMoney } from '../../../utils/formatMoney';
import { formatRelative } from '../../../utils/formatDate';

export default function RecentSales({ sales = [], currency = 'KES' }) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-[var(--text-primary)]">Recent sales</h2>
        <Link
          to="/sales"
          className="text-xs font-medium text-[var(--accent)] hover:underline flex items-center gap-1"
        >
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {sales.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-[var(--text-muted)] mb-4">No sales yet.</p>
          <Link to="/pos">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1" /> Make your first sale
            </Button>
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-[var(--border-color)]">
          {sales.map((s) => (
            <li key={s._id} className="flex items-center justify-between py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {formatMoney(s.totalCents, s.currency || currency)}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {formatRelative(s.createdAt)} · {s.paymentMethod}
                </p>
              </div>
              <Link
                to={`/sales/${s._id}`}
                className="text-xs font-medium text-[var(--accent)] hover:underline"
              >
                View
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}