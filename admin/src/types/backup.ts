export type BackupStatus = 'running' | 'success' | 'failed' | 'expired';
export type BackupType = 'manual' | 'auto';

export interface Backup {
  _id: string;
  filename: string;
  sizeBytes: number;
  checksum?: string;
  type: BackupType;
  status: BackupStatus;
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  triggeredBy?: string;
  error?: string;
  collections?: string[];
  recordCounts?: Record<string, number>;
  retentionUntil?: string;
  createdAt: string;
  updatedAt: string;
}