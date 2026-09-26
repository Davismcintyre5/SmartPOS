import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { siteApi } from '@/api/site';
import type {
  SiteSettings,
  Country,
  PublicPlan,
  PublicDownload,
  PublicAiFeatures,
} from '@/types/site';
import type { NormalizedError } from '@/types/api';

interface SiteContextValue {
  settings: SiteSettings | null;
  countries: Country[];
  currencies: string[];
  businessTypes: string[];
  plans: PublicPlan[];
  legalLinks: Record<string, string>;
  featureFlags: { registrationOpen: boolean; maintenanceMode: boolean };
  downloads: PublicDownload[];
  aiFeatures: PublicAiFeatures;
  loading: boolean;
  error: NormalizedError | null;
  reload: () => Promise<void>;
}

export const SiteContext = createContext<SiteContextValue | null>(null);

const DEFAULT_FLAGS = { registrationOpen: true, maintenanceMode: false };

const DEFAULT_AI: PublicAiFeatures = {
  landingAi: false,
  clientAi: false,
  fileUpload: false,
};

export function SiteProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [businessTypes, setBusinessTypes] = useState<string[]>([]);
  const [plans, setPlans] = useState<PublicPlan[]>([]);
  const [legalLinks, setLegalLinks] = useState<Record<string, string>>({});
  const [featureFlags, setFeatureFlags] = useState(DEFAULT_FLAGS);
  const [downloads, setDownloads] = useState<PublicDownload[]>([]);
  const [aiFeatures, setAiFeatures] = useState<PublicAiFeatures>(DEFAULT_AI);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<NormalizedError | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        nextSettings,
        nextCountries,
        nextCurrencies,
        nextBusinessTypes,
        nextPlans,
        nextLegalLinks,
        nextFlags,
        nextDownloads,
        nextAi,
      ] = await Promise.all([
        siteApi.getSettings().catch(() => null),
        siteApi.getCountries().catch(() => []),
        siteApi.getCurrencies().catch(() => []),
        siteApi.getBusinessTypes().catch(() => []),
        siteApi.getPlans().catch(() => []),
        siteApi.getLegalLinks().catch(() => ({})),
        siteApi.getFeatureFlags().catch(() => DEFAULT_FLAGS),
        siteApi.getDownloads().catch(() => []),
        siteApi.getAiFeatures().catch(() => DEFAULT_AI),
      ]);

      setSettings(nextSettings);
      setCountries(nextCountries);
      setCurrencies(nextCurrencies);
      setBusinessTypes(nextBusinessTypes);
      setPlans(nextPlans);
      setLegalLinks(nextLegalLinks);
      setFeatureFlags(nextFlags ?? DEFAULT_FLAGS);
      setDownloads(nextDownloads ?? []);
      setAiFeatures(nextAi ?? DEFAULT_AI);
    } catch (e) {
      setError(e as NormalizedError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const value = useMemo<SiteContextValue>(
    () => ({
      settings,
      countries,
      currencies,
      businessTypes,
      plans,
      legalLinks,
      featureFlags,
      downloads,
      aiFeatures,
      loading,
      error,
      reload,
    }),
    [
      settings,
      countries,
      currencies,
      businessTypes,
      plans,
      legalLinks,
      featureFlags,
      downloads,
      aiFeatures,
      loading,
      error,
      reload,
    ]
  );

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}