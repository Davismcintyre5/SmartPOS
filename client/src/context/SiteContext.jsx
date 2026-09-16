import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import storage from '../utils/storage';

const SiteContext = createContext(null);

const STORAGE_KEY = 'site';
const REFRESH_MS = 5 * 60 * 1000;

const DEFAULTS = {
  branding: {
    platformName: 'SmartPOS',
    logoUrl: null,
    supportEmail: 'support@smartpos.com',
    supportPhone: '',
    termsUrl: '',
    privacyUrl: ''
  },
  currencies: {
    system: ['KES', 'USD', 'EUR', 'GBP'],
    store: ['KES', 'USD', 'EUR', 'GBP', 'TZS', 'UGX', 'NGN', 'GHS', 'RWF', 'BIF'],
    defaultSubscription: 'USD',
    defaultStore: 'KES'
  },
  tax: { defaultRate: 0, label: 'VAT', inclusive: false },
  featureFlags: {
    apiAccess: true,
    loyalty: false,
    multiLocation: false,
    maintenanceMode: false
  },
  onboarding: {
    defaultPlan: 'trial',
    requireEmailVerification: false,
    requireAdminApproval: true,
    trialDays: 14,
    graceDays: 14
  },
  plans: [],
  paymentMethods: [],
  maintenanceMessage: ''
};

export function SiteProvider({ children }) {
  const [site, setSite] = useState(() => {
    const cached = storage.getItem(STORAGE_KEY);
    return cached ? { ...DEFAULTS, ...cached } : DEFAULTS;
  });
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/site');
      const data = res.data?.data || res.data;
      if (data) {
        setSite({ ...DEFAULTS, ...data });
        storage.setItem(STORAGE_KEY, data);
      }
    } catch {
      // fall back to cached
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, REFRESH_MS);
    return () => clearInterval(id);
  }, [refresh]);

  return (
    <SiteContext.Provider value={{ site, loading, refresh }}>
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSite must be used within SiteProvider');
  return ctx;
}