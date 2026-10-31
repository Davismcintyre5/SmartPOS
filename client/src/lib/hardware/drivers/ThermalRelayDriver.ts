import type { PrinterDriver, HardwareCapabilities, DiscoveredDevice } from '../types';
import type { PrinterConfig, ReceiptPayload } from '@/types/receipt';
import { buildEscPos } from '../escpos';

interface RelayHealthResponse {
  ok: boolean;
  version?: string;
}

interface RelayPrintersResponse {
  printers: Array<{ name: string; identifier: string }>;
}

export class ThermalRelayDriver implements PrinterDriver {
  readonly name = 'thermal_relay';
  private printerName = '';
  private relayUrl = 'http://localhost:9100';

  async initialize(config: PrinterConfig): Promise<void> {
    this.printerName = config.receiptPrinter?.identifier || config.receiptPrinter?.name || '';
    this.relayUrl = config.relayUrl || 'http://localhost:9100';

    if (!this.printerName) {
      throw new Error('No printer selected — configure one in settings');
    }

    try {
      const res = await fetch(`${this.relayUrl}/health`, {
        signal: AbortSignal.timeout(1500),
      });
      if (!res.ok) throw new Error('unhealthy');
      const data = (await res.json()) as RelayHealthResponse;
      if (!data.ok) throw new Error('unhealthy');
    } catch {
      throw new Error(
        `Print relay not running at ${this.relayUrl} — start the relay app on this PC`
      );
    }
  }

  capabilities(): HardwareCapabilities {
    return { thermal: true, drawer: true, ble: false, available: true };
  }

  async discover(): Promise<DiscoveredDevice[]> {
    try {
      const res = await fetch(`${this.relayUrl}/printers`, {
        signal: AbortSignal.timeout(2000),
      });
      if (!res.ok) return [];
      const data = (await res.json()) as RelayPrintersResponse;
      return (data.printers || []).map((p) => ({
        name: p.name,
        identifier: p.identifier,
        kind: 'printer' as const,
        connection: 'usb' as const,
      }));
    } catch {
      return [];
    }
  }

  async print(payload: ReceiptPayload): Promise<void> {
    const bytes = await buildEscPos(payload);
    const base64 = bytesToBase64(bytes);

    const res = await fetch(`${this.relayUrl}/print`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        printerName: this.printerName,
        escpos: base64,
      }),
    });

    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(err.error || `Print failed (${res.status})`);
    }
  }

  async kickDrawer(): Promise<void> {
    const res = await fetch(`${this.relayUrl}/kick-drawer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ printerName: this.printerName }),
    });

    if (!res.ok) {
      throw new Error('Cash drawer kick failed');
    }
  }
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}