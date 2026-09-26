export interface ElectronAppApi {
  getVersion(): Promise<string>;
  getPlatform(): Promise<string>;
  isPackaged(): Promise<boolean>;
  restart(): Promise<void>;
  quit(): Promise<void>;
  getDeviceInfo(): Promise<{
    deviceId: string;
    deviceName: string;
    platform: string;
    appVersion: string;
    electronVersion: string;
    nodeVersion: string;
  }>;
  setDeviceName(name: string): Promise<{ ok: boolean; deviceName: string }>;
  openLogs(): Promise<{ ok: boolean; path: string }>;
  openExternal(url: string): Promise<{ ok: boolean; error?: string }>;
  getPreference<T = unknown>(key: string): Promise<T>;
  setPreference(key: string, value: unknown): Promise<{ ok: boolean }>;
  setAuthToken(token: string | null): Promise<{ ok: boolean; error?: string }>;
  getAuthToken(): Promise<{ ok: boolean; token: string | null }>;
}

export interface ElectronPrinterApi {
  list(): Promise<
    Array<{
      name: string;
      displayName: string;
      description: string;
      status: number;
      isDefault: boolean;
    }>
  >;
  getConfig(): Promise<{ name: string; width: number; drawerEnabled: boolean }>;
  setConfig(patch: {
    name?: string;
    width?: number;
    drawerEnabled?: boolean;
  }): Promise<{
    ok: boolean;
    config: { name: string; width: number; drawerEnabled: boolean };
  }>;
  test(): Promise<{ ok: boolean; error?: string }>;
  printReceipt(
    sale: Record<string, unknown>,
    options?: Record<string, unknown>
  ): Promise<{ ok: boolean; error?: string }>;
}

export interface ElectronDrawerApi {
  open(): Promise<{ ok: boolean; error?: string; reason?: string }>;
  test(): Promise<{ ok: boolean; error?: string; reason?: string }>;
}

export interface CachedSaleItem {
  productId: string | null;
  name: string;
  qty: number;
  price: number;
  subtotal: number;
}

export interface CachedSale {
  id: string;
  saleNumber: string;
  total: number;
  currency: string;
  paymentMethod: string | null;
  customerName: string | null;
  createdAt: string;
  items: CachedSaleItem[];
}

export interface ElectronDbApi {
  getProducts(): Promise<{ ok: boolean; products: unknown[]; error?: string }>;
  getCustomers(): Promise<{ ok: boolean; customers: unknown[]; error?: string }>;
  getSettings(): Promise<{
    ok: boolean;
    settings: Record<string, unknown>;
    error?: string;
  }>;
  getRecentSales(
    limit?: number
  ): Promise<{ ok: boolean; sales: CachedSale[]; error?: string }>;
  refreshCatalog(): Promise<{ ok: boolean; error?: string }>;
}

export interface ElectronSyncStatus {
  network: 'unknown' | 'online' | 'degraded' | 'offline';
  latency: number;
  running: boolean;
  queued: number;
  failed: number;
  lastPushAt: number;
  lastCatalogAt: number;
  lastError: string | null;
  online: boolean;
}

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

export interface ElectronUpdaterApi {
  getStatus(): Promise<{ ok: boolean; status: unknown }>;
  check(): Promise<{ ok: boolean; error?: string; reason?: string }>;
  install(): Promise<{ ok: boolean; error?: string }>;
  dismiss(): Promise<{ ok: boolean }>;
  setChannel(
    channel: string
  ): Promise<{ ok: boolean; channel?: string; error?: string }>;
}

export interface ElectronWindowApi {
  minimize(): void;
  maximize(): void;
  close(): void;
}

export interface ElectronEventsApi {
  onNewSale(cb: () => void): () => void;
  onTraySyncNow(cb: () => void): () => void;
  onTrayOpenSettings(cb: () => void): () => void;
}

export interface ElectronBridge {
  isElectron: true;
  platform: NodeJS.Platform;
  versions: {
    electron: string;
    chrome: string;
    node: string;
  };
  app: ElectronAppApi;
  printer: ElectronPrinterApi;
  drawer: ElectronDrawerApi;
  db: ElectronDbApi;
  sync: ElectronSyncApi;
  updater: ElectronUpdaterApi;
  window: ElectronWindowApi;
  events: ElectronEventsApi;
}

declare global {
  interface Window {
    electron?: ElectronBridge;
  }
}

export {};