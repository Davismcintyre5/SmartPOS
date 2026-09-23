export const ROUTES = {
  login: '/login',
  dashboard: '/',
  tenants: '/tenants',
  tenantDetail: (id: string) => `/tenants/${id}`,
  pending: '/pending',
  plans: '/plans',
  paymentMethods: '/payment-methods',
  settings: '/settings',
  legal: '/legal',
  legalEditor: (type: string, version?: number) =>
    version ? `/legal/${type}/${version}` : `/legal/${type}/new`,
  backups: '/backups',
  aiUsage: '/ai-usage',
  audit: '/audit',
  health: '/health',
  profile: '/profile',
  forbidden: '/403',
};

export const TENANT_STATUS = {
  PENDING_USER: 'pending_user',
  ACTIVE: 'active',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
  EXPIRED: 'expired',
} as const;

export const PENDING_STATUS = {
  PENDING: 'pending',
  IN_REVIEW: 'in_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
} as const;

export const BACKUP_STATUS = {
  RUNNING: 'running',
  SUCCESS: 'success',
  FAILED: 'failed',
  EXPIRED: 'expired',
} as const;

export const BACKUP_TYPE = {
  MANUAL: 'manual',
  AUTO: 'auto',
} as const;

export const AI_TYPES = {
  SUMMARIZE: 'summarize',
  CHAT: 'chat',
  FORECAST: 'forecast',
  ANOMALY: 'anomaly',
  STOCK: 'stock',
  PUBLIC_CHAT: 'public_chat',
} as const;

export const LEGAL_TYPES = ['terms', 'privacy', 'dpa', 'refund', 'aup'] as const;

export const DEFAULT_PAGE_SIZE = 20;

export const TOAST_DURATION = 4000;