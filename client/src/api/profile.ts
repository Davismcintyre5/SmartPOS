import { api } from './axios';

export interface BusinessProfile {
  id: string;
  name: string;
  slug: string;
  country: string;
  businessType: string;
  status: string;
  planId: string;
  settings: Record<string, unknown>;
}

export interface OwnerProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
}

export interface ProfileResponse {
  tenant: BusinessProfile;
  owner: OwnerProfile | null;
}

export interface UpdateProfileInput {
  name?: string;
  country?: string;
  businessType?: string;
  address?: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
  logoPublicId?: string;
}

export interface UpdateMeInput {
  fullName?: string;
  phone?: string;
}

export const profileApi = {
  get: () =>
    api.get<{ data: ProfileResponse }>('/client/profile').then((r) => r.data.data),

  update: (patch: UpdateProfileInput) =>
    api.patch<{ data: BusinessProfile }>('/client/profile', patch).then((r) => r.data.data),

  updateMe: (patch: UpdateMeInput) =>
    api
      .patch<{ data: OwnerProfile }>('/client/profile/me', patch)
      .then((r) => r.data.data),

  uploadLogo: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api
      .post<{ data: { url: string; publicId: string } }>(
        '/client/profile/logo',
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      .then((r) => r.data.data);
  },
};