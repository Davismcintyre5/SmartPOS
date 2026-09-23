import { api } from './axios';
import type {
  PlatformSettings,
  FeatureFlags,
  UpdateSettingsPayload,
  UpdateFeaturesPayload,
} from '@/types/settings';

export const settingsApi = {
  get: () =>
    api
      .get<{ data: PlatformSettings }>('/admin/settings')
      .then((r) => r.data.data),

  update: (payload: UpdateSettingsPayload) =>
    api
      .patch<{ data: PlatformSettings }>('/admin/settings', payload)
      .then((r) => r.data.data),

  getPublic: () =>
    api
      .get<{ data: PlatformSettings }>('/admin/settings/public')
      .then((r) => r.data.data),

  getFeatures: () =>
    api
      .get<{ data: FeatureFlags }>('/admin/settings/features')
      .then((r) => r.data.data),

  updateFeatures: (payload: UpdateFeaturesPayload) =>
    api
      .patch<{ data: FeatureFlags }>('/admin/settings/features', payload)
      .then((r) => r.data.data),
};