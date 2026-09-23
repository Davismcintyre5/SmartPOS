export interface SiteSettings {
  platformName: string;
  platformLogoUrl: string | null;
  supportEmail: string | null;
  supportPhone: string | null;
  defaultCurrency: string;
  defaultCountry: string;
  minPasswordLength: number;
  registrationOpen: boolean;
  maintenanceMode: boolean;
}

export interface Country {
  code: string;
  name: string;
  currency: string;
  dialCode: string;
}

export interface PublicPlan {
  code: string;
  name: string;
  description?: string;
  price: {
    amount: number;
    currency: string;
    interval: 'once' | 'month' | 'year';
  };
  limits: {
    maxOwners: number;
    maxManagers: number;
    maxCashiers: number;
    maxProducts: number;
    maxTransactionsPerMonth: number;
    maxAiCallsPerDay: number;
  };
  features: {
    aiInsights: boolean;
    multiLocation: boolean;
    api: boolean;
    prioritySupport: boolean;
    customDomain: boolean;
  };
  trialDays: number;
}

export interface PublicDownload {
  id: string;
  name: string;
  type: 'windows' | 'macos' | 'linux' | 'android' | 'ios';
  version: string;
  arch: string | null;
  link: string;
  size: string | null;
  minOS: string | null;
  releaseNotes: string;
}

export interface PublicAiFeatures {
  landingAi: boolean;
  clientAi: boolean;
  fileUpload: boolean;
}