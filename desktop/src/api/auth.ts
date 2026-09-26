import { api } from './axios';
import type {
  RegisterInput,
  LoginResponse,
  RegisterResponse,
  MeResponse,
  User,
  Tenant,
  Plan,
} from '@/types/auth';

export const authApi = {
  register: (payload: RegisterInput) =>
    api
      .post<{ data: RegisterResponse }>('/public/auth/register', payload)
      .then((r) => r.data.data),

  login: (email: string, password: string) =>
    api
      .post<{ data: LoginResponse }>('/public/auth/login', { email, password })
      .then((r) => r.data.data),

  logout: () => api.post('/client/auth/logout').then((r) => r.data.data),

  me: () =>
    api
      .get<{ data: MeResponse }>('/client/auth/me')
      .then((r) => r.data.data),

  refresh: (refreshToken: string) =>
    api
      .post<{ data: { accessToken: string; refreshToken: string } }>(
        '/public/auth/refresh',
        { refreshToken }
      )
      .then((r) => r.data.data),

  changePassword: (currentPassword: string, newPassword: string) =>
    api
      .post('/client/auth/change-password', { currentPassword, newPassword })
      .then((r) => r.data.data),

  forgotPassword: (email: string) =>
    api.post('/public/auth/forgot-password', { email }).then((r) => r.data.data),

  resetPassword: (token: string, newPassword: string) =>
    api
      .post('/public/auth/reset-password', { token, newPassword })
      .then((r) => r.data.data),

  acceptInvite: (token: string, password: string, fullName?: string) =>
    api
      .post('/public/auth/accept-invite', { token, password, fullName })
      .then((r) => r.data.data),
};