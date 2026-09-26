export interface ElectronSyncApi {
  enqueueSale(
    payload: Record<string, unknown>
  ): Promise<{ ok: boolean; localId?: string; error?: string }>;
  enqueueCustomer(
    payload: Record<string, unknown>
  ): Promise<{ ok: boolean; localId?: string; error?: string }>;
  getStatus(): Promise<{
    ok: boolean;
    status: ElectronSyncStatus | null;
    error?: string;
  }>;
  getQueue(): Promise<{ ok: boolean; queue: unknown[]; error?: string }>;
  getCounts(): Promise<{
    ok: boolean;
    counts: {
      pending: number;
      syncing: number;
      failed: number;
      synced: number;
      total: number;
    } | null;
    error?: string;
  }>;
  forceSync(): Promise<{
    ok: boolean;
    status?: ElectronSyncStatus;
    error?: string;
  }>;
  activateBranch(branchId: string): Promise<{
    ok: boolean;
    branchId?: string;
    registered?: boolean;
    error?: string;
  }>;
}