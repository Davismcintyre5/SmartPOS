import { api } from './axios';
import type {
  LegalDoc,
  LegalByType,
  LegalType,
  LegalCurrentPublic,
  PublishLegalPayload,
  UpdateLegalDraftPayload,
} from '@/types/legal';

export const legalApi = {
  list: (type?: LegalType) =>
    api
      .get<{ data: LegalByType | LegalDoc[] }>('/admin/legal', {
        params: type ? { type } : undefined,
      })
      .then((r) => r.data.data),

  getByType: (type: LegalType) =>
    api
      .get<{ data: LegalDoc[] }>(`/admin/legal/${type}`)
      .then((r) => r.data.data),

  getCurrent: (type: LegalType) =>
    api
      .get<{ data: LegalCurrentPublic }>(`/admin/legal/${type}/current`)
      .then((r) => r.data.data),

  getByVersion: (type: LegalType, version: number) =>
    api
      .get<{ data: LegalDoc }>(`/admin/legal/${type}/${version}`)
      .then((r) => r.data.data),

  publish: (type: LegalType, payload: PublishLegalPayload) =>
    api
      .post<{ data: LegalDoc }>(`/admin/legal/${type}/publish`, payload)
      .then((r) => r.data.data),

  updateDraft: (id: string, payload: UpdateLegalDraftPayload) =>
    api
      .patch<{ data: LegalDoc }>(`/admin/legal/${id}`, payload)
      .then((r) => r.data.data),

  removeDraft: (id: string) =>
    api.delete(`/admin/legal/${id}`).then((r) => r.data),
};