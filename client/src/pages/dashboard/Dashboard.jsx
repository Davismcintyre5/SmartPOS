import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, ShoppingCart, Package, Receipt, ArrowRight } from 'lucide-react';
import { getDashboard } from '../../api/reports';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatMoney } from '../../utils/formatMoney';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';

import WelcomeHeader from '../../components/app/dashboard/WelcomeHeader';
import StatCard from '../../components/app/dashboard/StatCard';
import SalesChart from '../../components/app/dashboard/SalesChart';
import LowStockList from '../../components/app/dashboard/LowStockList';
import RecentSales from '../../components/app/dashboard/RecentSales';
import QuickActions from '../../components/app/dashboard/QuickActions';

export default function Dashboard() {
  const { user, client } = useAuth();
  const toast = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then((res) => setData(res?.data || res))
      .catch((err) => toast.error(err?.message || 'Could not load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!data) return null;

  const currency = data.currency || client?.storeCurrency || 'KES';
  const firstName = (user?.name || '').split(' ')[0] || 'there';

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <WelcomeHeader name={firstName} storeName={client?.name || 'your store'} />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={TrendingUp}
          label="Today's sales"
          value={formatMoney(data.today.revenueCents, currency)}
          accent
        />
        <StatCard
          icon={ShoppingCart}
          label="Transactions"
          value={data.today.salesCount}
        />
        <StatCard
          icon={Receipt}
          label="Avg. sale"
          value={formatMoney(data.today.avgSaleCents, currency)}
        />
        <StatCard
          icon={Package}
          label="Products"
          value={data.productsCount}
        />
      </div>

      {/* Chart + Low stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[var(--text-primary)]">Last 7 days</h2>
            <Link
              to="/reports"
              className="text-xs font-medium text-[var(--accent)] hover:underline flex items-center gap-1"
            >
              View reports <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <SalesChart chart={data.chart} currency={currency} />
        </Card>

        <LowStockList products={data.lowStockProducts} />
      </div>

      {/* Recent + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RecentSales sales={data.recentSales} currency={currency} />
        </div>
        <QuickActions />
      </div>
    </div>
  );
}