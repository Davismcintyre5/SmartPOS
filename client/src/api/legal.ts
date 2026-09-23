import { api } from './axios';
import type { LegalType, LegalCurrentPublic } from '@/types/legal';

export const legalApi = {
  getCurrent: (type: LegalType) =>
    api
      .get<{ data: LegalCurrentPublic }>(`/public/legal/${type}`)
      .then((r) => r.data.data),
};