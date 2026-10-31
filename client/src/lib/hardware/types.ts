import type { ReceiptPayload } from '@/types/receipt';

export interface HardwareCapabilities {
  thermal: boolean;
  drawer: boolean;
  ble: boolean;
  available: boolean;
}

export interface DiscoveredDevice {
  name: string;
  identifier: string;
  kind: 'printer' | 'scanner' | 'drawer';
  connection: 'usb' | 'network' | 'bluetooth' | 'serial' | 'unknown';
}

export interface PrintResult {
  success: boolean;
  durationMs: number;
  error?: string;
}

export interface PrinterDriver {
  readonly name: string;

  initialize?: (config: import('@/types/receipt').PrinterConfig) => Promise<void>;

  capabilities: () => HardwareCapabilities;

  discover?: () => Promise<DiscoveredDevice[]>;

  print: (payload: ReceiptPayload) => Promise<void>;

  kickDrawer?: () => Promise<void>;
}