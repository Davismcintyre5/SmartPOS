export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';
export type ServiceState = 'up' | 'down' | 'enabled' | 'disabled' | 'connected';

export interface ServerHealth {
  status: string;
  version: string;
  node: string;
  platform: string;
  hostname: string;
  url: string | null;
  uptimeSeconds: number;
  uptimeHuman: string;
  cpuCores: number;
  memoryRssMb: number;
  memoryHeapUsedMb: number;
  pid: number;
}

export interface DatabaseHealth {
  status: string;
  type: string;
  host: string;
  database: string | null;
  collections: number;
  documents: number;
}

export interface RedisHealth {
  status: 'up' | 'down' | 'disabled';
  enabled: boolean;
  host: string;
  message?: string;
  memoryUsed?: string | null;
  error?: string;
}

export interface EmailHealth {
  status: string;
  enabled: boolean;
  provider: string;
  from: string | null;
  fromMasked: string | null;
  sender: string | null;
}

export interface SmsHealth {
  status: string;
  enabled: boolean;
  provider: string;
  sender: string | null;
}

export interface StorageHealth {
  status: string;
  enabled: boolean;
  type: string;
  cloud: string | null;
}

export interface BackupHealth {
  status: string;
  type: string;
  folder: string;
  count: number;
  lastBackupAt: string | null;
  lastBackupSize: number | null;
}

export interface HealthPlatformInfo {
  platformName: string;
  logoUrl: string | null;
  supportEmail: string | null;
  supportPhone: string | null;
}

export interface HealthResponse {
  status: HealthStatus;
  overall: { up: number; total: number };
  timestamp: string;
  platform: HealthPlatformInfo;
  server: ServerHealth;
  database: DatabaseHealth;
  redis: RedisHealth;
  email: EmailHealth;
  sms: SmsHealth;
  storage: StorageHealth;
  backups: BackupHealth;
  cors: string[];
}

export interface HealthReadyResponse {
  ready: boolean;
}

export interface HealthMetricsResponse {
  uptimeSeconds: number;
  uptimeHuman: string;
  memory: {
    rssMb: number;
    heapTotalMb: number;
    heapUsedMb: number;
    externalMb: number;
  };
  cpu: {
    cores: number;
    loadAvg: number[];
    model: string | null;
  };
  node: string;
  platform: string;
  pid: number;
}