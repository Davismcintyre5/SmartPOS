import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getSettings } from '../../api/settings';
import Spinner from '../../components/ui/Spinner';
import {
  HiOfficeBuilding, HiReceiptTax, HiCash, HiCreditCard,
  HiStar, HiSparkles, HiRefresh, HiColorSwatch
} from 'react-icons/hi';

import StoreSettings from './StoreSettings';
import ReceiptSettings from './ReceiptSettings';
import TaxDiscountSettings from './TaxDiscountSettings';
import CurrencySettings from './CurrencySettings';
import LoyaltySettings from './LoyaltySettings';
import AiSettings from './AiSettings';
import SyncSettings from './SyncSettings';
import ThemeSettings from './ThemeSettings';

const TABS = [
  { key: 'store',     label: 'Store',           icon: HiOfficeBuilding, roles: ['owner', 'manager'] },
  { key: 'receipt',   label: 'Receipt',         icon: HiReceiptTax,     roles: ['owner', 'manager'] },
  { key: 'tax',       label: 'Tax & Discount',  icon: HiCash,           roles: ['owner', 'manager'] },
  { key: 'currency',  label: 'Currency',        icon: HiCreditCard,     roles: ['owner'] },
  { key: 'loyalty',   label: 'Loyalty Points',  icon: HiStar,           roles: ['owner', 'manager'] },
  { key: 'ai',        label: 'AI',              icon: HiSparkles,       roles: ['owner', 'manager'] },
  { key: 'sync',      label: 'Sync',            icon: HiRefresh,        roles: ['owner', 'manager'] },
  { key: 'theme',     label: 'Theme',           icon: HiColorSwatch,    roles: ['owner', 'manager', 'cashier'] }
];

export default function Settings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const role = user?.role || 'cashier';
  const visibleTabs = TABS.filter((t) => t.roles.includes(role));

  const [activeTab, setActiveTab] = useState(visibleTabs[0]?.key || 'theme');

  const fetchSettings = () => {
    setLoading(true);
    getSettings()
      .then((res) => setSettings(res?.data || res))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSettings(); }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  }

  const onSave = (patch) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Settings</h1>

      <div className="flex gap-0 border-b border-[var(--border-color)] mb-6 overflow-x-auto">
        {visibleTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-[var(--accent)] text-[var(--accent)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'store' && (
        <StoreSettings settings={settings} onSaved={onSave} onReload={fetchSettings} />
      )}
      {activeTab === 'receipt' && (
        <ReceiptSettings settings={settings} onSaved={onSave} />
      )}
      {activeTab === 'tax' && (
        <TaxDiscountSettings settings={settings} onSaved={onSave} />
      )}
      {activeTab === 'currency' && (
        <CurrencySettings settings={settings} onSaved={onSave} />
      )}
      {activeTab === 'loyalty' && (
        <LoyaltySettings settings={settings} onSaved={onSave} />
      )}
      {activeTab === 'ai' && (
        <AiSettings settings={settings} onSaved={onSave} />
      )}
      {activeTab === 'sync' && (
        <SyncSettings settings={settings} onSaved={onSave} />
      )}
      {activeTab === 'theme' && <ThemeSettings />}
    </div>
  );
}