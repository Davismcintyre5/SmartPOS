export interface Admin {
  id: string;
  email: string;
  fullName: string;
  role: 'super_admin';
  lastLoginAt?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  admin: Admin;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}