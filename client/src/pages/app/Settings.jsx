// pages/app/Settings.jsx
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { User, Building, DollarSign, Brain, CreditCard, Users, Receipt, Percent } from "lucide-react";
import { ProfileSettings } from "../../components/settings/ProfileSettings";
import { BusinessSettings } from "../../components/settings/BusinessSettings";
import { CurrencySettings } from "../../components/settings/CurrencySettings";
import { AISettings } from "../../components/settings/AISettings";
import { SubscriptionSettings } from "../../components/settings/SubscriptionSettings";
import { UserManagement } from "../../components/settings/UserManagement";
import { ReceiptSettings } from "../../components/settings/ReceiptSettings";
import { TaxDiscountSettings } from "../../components/settings/TaxDiscountSettings";

const allTabs = [
  { key: "profile", label: "Profile", icon: User, component: ProfileSettings, perm: null },
  { key: "business", label: "Business", icon: Building, component: BusinessSettings, perm: "manageStaff" },
  { key: "currency", label: "Currency", icon: DollarSign, component: CurrencySettings, perm: "manageProducts" },
  { key: "tax", label: "Tax & Discount", icon: Percent, component: TaxDiscountSettings, perm: "manageStaff" },
  { key: "receipt", label: "Receipt", icon: Receipt, component: ReceiptSettings, perm: "manageStaff" },
  { key: "ai", label: "AI & API Keys", icon: Brain, component: AISettings, perm: "manageProducts" },
  { key: "subscription", label: "Subscription", icon: CreditCard, component: SubscriptionSettings, perm: "manageStaff" },
  { key: "users", label: "Staff", icon: Users, component: UserManagement, perm: "manageStaff" },
];

export const Settings = () => {
  const { user, hasPermission } = useAuth();

  const tabs = allTabs.filter((tab) => {
    if (tab.perm === null) return true;
    if (user?.role === "owner") return true;
    return hasPermission(tab.perm);
  });

  const [activeTab, setActiveTab] = useState(tabs[0]?.key || "profile");
  const ActiveComponent = tabs.find((t) => t.key === activeTab)?.component || ProfileSettings;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        <nav className="lg:w-56 flex-shrink-0 flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
};