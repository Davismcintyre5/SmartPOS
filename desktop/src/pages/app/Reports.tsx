import { useMemo, useState } from 'react';
import {
  TrendingUp,
  Package,
  Users,
  Truck,
  UserCog,
  PieChart,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  DateRangePicker,
  rangeToParams,
  type RangeValue,
} from '@/components/reports/DateRangePicker';
import { ReportTabs, type ReportTabDef } from '@/components/reports/ReportTabs';
import { SalesReportTab } from '@/components/reports/SalesReportTab';
import { InventoryReportTab } from '@/components/reports/InventoryReportTab';
import { CustomersReportTab } from '@/components/reports/CustomersReportTab';
import { SuppliersReportTab } from '@/components/reports/SuppliersReportTab';
import { StaffReportTab } from '@/components/reports/StaffReportTab';
import { GeneralReportTab } from '@/components/reports/GeneralReportTab';
import type { UserRole } from '@/types/auth';

const TABS: Array<ReportTabDef & { roles: UserRole[] }> = [
  {
    key: 'sales',
    label: 'Sales',
    icon: TrendingUp,
    roles: ['owner', 'manager', 'cashier'],
  },
  {
    key: 'inventory',
    label: 'Inventory',
    icon: Package,
    roles: ['owner', 'manager', 'cashier'],
  },
  {
    key: 'customers',
    label: 'Customers',
    icon: Users,
    roles: ['owner', 'manager'],
  },
  {
    key: 'suppliers',
    label: 'Suppliers & POs',
    icon: Truck,
    roles: ['owner', 'manager'],
  },
  {
    key: 'staff',
    label: 'Staff',
    icon: UserCog,
    roles: ['owner', 'manager'],
  },
  {
    key: 'general',
    label: 'General',
    icon: PieChart,
    roles: ['owner', 'manager'],
  },
];

export default function Reports() {
  const { user } = useAuth();
  const userRole: UserRole = (user?.role ?? 'cashier') as UserRole;

  const visibleTabs = useMemo(
    () => TABS.filter((t) => t.roles.includes(userRole)),
    [userRole]
  );

  const [range, setRange] = useState<RangeValue>({ period: 'month' });
  const [activeTab, setActiveTab] = useState<string>(
    visibleTabs[0]?.key ?? 'sales'
  );

  const params = useMemo(() => rangeToParams(range), [range]);

  const content = (() => {
    switch (activeTab) {
      case 'sales':
        return <SalesReportTab params={params} />;
      case 'inventory':
        return <InventoryReportTab params={params} />;
      case 'customers':
        return <CustomersReportTab params={params} />;
      case 'suppliers':
        return <SuppliersReportTab params={params} />;
      case 'staff':
        return <StaffReportTab params={params} />;
      case 'general':
        return <GeneralReportTab params={params} />;
      default:
        return null;
    }
  })();

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Business analytics and exports
        </p>
      </div>

      <DateRangePicker value={range} onChange={setRange} />

      <div className="flex flex-col gap-6 lg:flex-row">
        <ReportTabs
          tabs={visibleTabs}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
        <div className="min-w-0 flex-1">{content}</div>
      </div>
    </div>
  );
}