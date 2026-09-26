import { api } from './axios';
import type {
  SiteSettings,
  Country,
  PublicPlan,
  PublicDownload,
  PublicAiFeatures,
} from '@/types/site';

export const siteApi = {
  getSettings: () =>
    api.get<{ data: SiteSettings }>('/public/site/settings').then((r) => r.data.data),

  getBusinessTypes: () =>
    api.get<{ data: string[] }>('/public/site/business-types').then((r) => r.data.data),

  getCountries: () =>
    api.get<{ data: Country[] }>('/public/site/countries').then((r) => r.data.data),

  getCurrencies: () =>
    api.get<{ data: string[] }>('/public/site/currencies').then((r) => r.data.data),

  getLegalLinks: () =>
    api
      .get<{ data: Record<string, string> }>('/public/site/legal-links')
      .then((r) => r.data.data),

  getFeatureFlags: () =>
    api
      .get<{ data: { registrationOpen: boolean; maintenanceMode: boolean } }>(
        '/public/site/feature-flags'
      )
      .then((r) => r.data.data),

  getPlans: () =>
    api.get<{ data: PublicPlan[] }>('/public/site/plans').then((r) => r.data.data),

  getDownloads: () =>
    api
      .get<{ data: PublicDownload[] }>('/public/site/downloads')
      .then((r) => r.data.data),

  getAiFeatures: () =>
    api
      .get<{ data: PublicAiFeatures }>('/public/site/ai')
      .then((r) => r.data.data),
};