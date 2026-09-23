import { useState } from 'react';
import {
  User,
  Building2,
  DollarSign,
  Percent,
  Receipt,
  KeyRound,
  CreditCard,
  Users,
  Smartphone,
} from 'lucide-react';
import { cn } from '@/utils/classNames';
import { useAuth } from '@/hooks/useAuth';
import { ProfileSettings } from '@/components/settings/ProfileSettings';
import { BusinessSettings } from '@/components/settings/BusinessSettings';
import { CurrencySettings } from '@/components/settings/CurrencySettings';
import { TaxSettings } from '@/components/settings/TaxSettings';
import { ReceiptSettings } from '@/components/settings/ReceiptSettings';
import { ApiKeysSettings } from '@/components/settings/ApiKeysSettings';
import { SubscriptionSettings } from '@/components/settings/SubscriptionSettings';
import { StaffSettings } from '@/components/settings/StaffSettings';
import { PaymentSettings } from '@/components/settings/PaymentSettings';

const ALL_TABS = [
  { key: 'profile', label: 'Profile', icon: User, roles: ['owner', 'manager', 'cashier'] },
  { key: 'business', label: 'Business', icon: Building2, roles: ['owner', 'manager'] },
  { key: 'currency', label: 'Currency', icon: DollarSign, roles: ['owner'] },
  { key: 'tax', label: 'Tax, Discount & Loyalty', icon: Percent, roles: ['owner', 'manager'] },
  { key: 'receipt', label: 'Receipt', icon: Receipt, roles: ['owner', 'manager'] },
  { key: 'payments', label: 'Payments', icon: Smartphone, roles: ['owner'] },
  { key: 'api-keys', label: 'API Keys', icon: KeyRound, roles: ['owner'] },
  { key: 'subscription', label: 'Subscription', icon: CreditCard, roles: ['owner'] },
  { key: 'staff', label: 'Staff', icon: Users, roles: ['owner'] },
];

export default function Settings() {
  const { user } = useAuth();

  const tabs = ALL_TABS.filter((t) => t.roles.includes(user?.role ?? ''));

  const [activeTab, setActiveTab] = useState(tabs[0]?.key ?? 'profile');

  const ActiveComponent = (() => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings />;
      case 'business':
        return <BusinessSettings />;
      case 'currency':
        return <CurrencySettings />;
      case 'tax':
        return <TaxSettings />;
      case 'receipt':
        return <ReceiptSettings />;
      case 'payments':
        return <PaymentSettings />;
      case 'api-keys':
        return <ApiKeysSettings />;
      case 'subscription':
        return <SubscriptionSettings />;
      case 'staff':
        return <StaffSettings />;
      default:
        return <ProfileSettings />;
    }
  })();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-foreground">Settings</h1>

      <div className="flex flex-col gap-6 lg:flex-row">
        <nav className="flex flex-shrink-0 gap-1 overflow-x-auto pb-2 lg:w-56 lg:flex-col lg:pb-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="flex-1 rounded-xl border border-border bg-card p-6">
          {ActiveComponent}
        </div>
      </div>
    </div>
  );
}