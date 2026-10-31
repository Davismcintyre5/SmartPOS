import type { PrinterDriver, HardwareCapabilities, DiscoveredDevice } from '../types';
import type { PrinterConfig, ReceiptPayload } from '@/types/receipt';

declare global {
  interface Window {
    __smartpos_hardware_bridge__?: {
      printEscPos: (printerName: string, bytes: number[]) => Promise<void>;
      kickDrawer: (printerName: string) => Promise<void>;
      discoverPrinters: () => Promise<DiscoveredDevice[]>;
    };
  }
}

export class ThermalUsbDriver implements PrinterDriver {
  readonly name = 'thermal_usb';
  private printerName = '';

  async initialize(config: PrinterConfig): Promise<void> {
    this.printerName = config.receiptPrinter?.identifier || '';
    if (!this.printerName) {
      throw new Error('Printer identifier not configured');
    }
    if (!window.__smartpos_hardware_bridge__) {
      throw new Error(
        'Thermal USB printing requires the desktop app (not available in browser)'
      );
    }
  }

  capabilities(): HardwareCapabilities {
    const hasBridge = Boolean(window.__smartpos_hardware_bridge__);
    return { thermal: true, drawer: true, ble: false, available: hasBridge };
  }

  async discover(): Promise<DiscoveredDevice[]> {
    const bridge = window.__smartpos_hardware_bridge__;
    if (!bridge) return [];
    return bridge.discoverPrinters();
  }

  async print(payload: ReceiptPayload): Promise<void> {
    const bridge = window.__smartpos_hardware_bridge__;
    if (!bridge) {
      throw new Error('Desktop hardware bridge not available');
    }

    const { buildEscPos } = await import('../escpos');
    const bytes = await buildEscPos(payload);
    await bridge.printEscPos(this.printerName, Array.from(bytes));
  }

  async kickDrawer(): Promise<void> {
    const bridge = window.__smartpos_hardware_bridge__;
    if (!bridge) return;
    await bridge.kickDrawer(this.printerName);
  }
}