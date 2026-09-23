import { api } from './axios';
import type {
  LoginPayload,
  LoginResponse,
  RefreshResponse,
  Admin,
  ChangePasswordPayload,
} from '@/types/auth';

export const adminAuthApi = {
  login: (email: string, password: string) =>
    api
      .post<{ data: LoginResponse }>('/admin/auth/login', { email, password } as LoginPayload)
      .then((r) => r.data.data),

  logout: () =>
    api.post('/admin/auth/logout').then((r) => r.data.data),

  me: () =>
    api.get<{ data: Admin }>('/admin/auth/me').then((r) => r.data.data),

  refresh: (refreshToken: string) =>
    api
      .post<{ data: RefreshResponse }>('/admin/auth/refresh', { refreshToken })
      .then((r) => r.data.data),

  changePassword: (payload: ChangePasswordPayload) =>
    api.post('/admin/auth/change-password', payload).then((r) => r.data.data),
};