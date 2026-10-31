import type { PrinterDriver, HardwareCapabilities, DiscoveredDevice } from '../types';
import type { PrinterConfig, ReceiptPayload } from '@/types/receipt';

declare global {
  interface Window {
    __smartpos_mobile_bridge__?: {
      connectBlePrinter: (deviceId: string) => Promise<void>;
      printBle: (bytes: number[]) => Promise<void>;
      kickDrawerBle: () => Promise<void>;
      discoverBlePrinters: () => Promise<DiscoveredDevice[]>;
    };
  }
}

export class ThermalBleDriver implements PrinterDriver {
  readonly name = 'thermal_ble';
  private deviceId = '';

  async initialize(config: PrinterConfig): Promise<void> {
    this.deviceId = config.receiptPrinter?.identifier || '';
    if (!this.deviceId) {
      throw new Error('BLE printer not configured');
    }

    const bridge = window.__smartpos_mobile_bridge__;
    if (!bridge) {
      throw new Error(
        'Bluetooth printing requires the mobile app (not available in browser)'
      );
    }

    await bridge.connectBlePrinter(this.deviceId);
  }

  capabilities(): HardwareCapabilities {
    const hasBridge = Boolean(window.__smartpos_mobile_bridge__);
    return { thermal: true, drawer: true, ble: true, available: hasBridge };
  }

  async discover(): Promise<DiscoveredDevice[]> {
    const bridge = window.__smartpos_mobile_bridge__;
    if (!bridge) return [];
    return bridge.discoverBlePrinters();
  }

  async print(payload: ReceiptPayload): Promise<void> {
    const bridge = window.__smartpos_mobile_bridge__;
    if (!bridge) {
      throw new Error('Mobile hardware bridge not available');
    }

    const { buildEscPos } = await import('../escpos');
    const bytes = await buildEscPos(payload);
    await bridge.printBle(Array.from(bytes));
  }

  async kickDrawer(): Promise<void> {
    const bridge = window.__smartpos_mobile_bridge__;
    if (!bridge) return;
    await bridge.kickDrawerBle();
  }
}