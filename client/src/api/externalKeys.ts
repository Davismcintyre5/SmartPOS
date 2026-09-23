import { api } from './axios';

export interface ExternalKeyInfo {
  id: string;
  name: string;
  prefix: string;
  lastUsedAt: string | null;
  createdAt: string;
}

export interface ExternalKeyCreated {
  id: string;
  name: string;
  prefix: string;
  key: string;
  createdAt: string;
}

export const externalKeyApi = {
  get: () =>
    api
      .get<{ data: ExternalKeyInfo | null }>('/client/external-keys')
      .then((r) => r.data.data),

  create: (name: string) =>
    api
      .post<{ data: ExternalKeyCreated }>('/client/external-keys', { name })
      .then((r) => r.data.data),

  revoke: () =>
    api.delete('/client/external-keys').then((r) => r.data),
};