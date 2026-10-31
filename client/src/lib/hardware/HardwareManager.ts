import type {
  PrinterConfig,
  PrinterDriverMode,
  ReceiptPayload,
} from '@/types/receipt';
import type { DiscoveredDevice, HardwareCapabilities, PrinterDriver, PrintResult } from './types';
import { BrowserPrintDriver } from './drivers/BrowserPrintDriver';
import { ThermalUsbDriver } from './drivers/ThermalUsbDriver';
import { ThermalRelayDriver } from './drivers/ThermalRelayDriver';
import { ThermalBleDriver } from './drivers/ThermalBleDriver';

function createDriver(mode: PrinterDriverMode): PrinterDriver {
  switch (mode) {
    case 'thermal_usb':
      return new ThermalUsbDriver();
    case 'thermal_relay':
      return new ThermalRelayDriver();
    case 'thermal_ble':
      return new ThermalBleDriver();
    case 'browser_print':
    case 'none':
    default:
      return new BrowserPrintDriver();
  }
}

class HardwareManager {
  private driver: PrinterDriver = new BrowserPrintDriver();
  private config: PrinterConfig | null = null;
  private loadError: string | null = null;

  async load(config: PrinterConfig | null): Promise<void> {
    this.config = config;
    this.loadError = null;

    if (!config) {
      this.driver = new BrowserPrintDriver();
      return;
    }

    const next = createDriver(config.driverMode);

    try {
      if (next.initialize) {
        await next.initialize(config);
      }
      this.driver = next;
    } catch (err) {
      this.loadError = err instanceof Error ? err.message : String(err);
      this.driver = new BrowserPrintDriver();
      if (typeof console !== 'undefined') {
        console.warn(
          `[hardware] ${config.driverMode} init failed — falling back to browser print:`,
          this.loadError
        );
      }
    }
  }

  getConfig(): PrinterConfig | null {
    return this.config;
  }

  getLoadError(): string | null {
    return this.loadError;
  }

  getDriverName(): string {
    return this.driver.name;
  }

  capabilities(): HardwareCapabilities {
    return this.driver.capabilities();
  }

  async discover(): Promise<DiscoveredDevice[]> {
    if (!this.driver.discover) return [];
    try {
      return await this.driver.discover();
    } catch {
      return [];
    }
  }

  async printReceipt(payload: ReceiptPayload): Promise<PrintResult> {
    const t0 = Date.now();
    try {
      await this.driver.print(payload);
      return { success: true, durationMs: Date.now() - t0 };
    } catch (err) {
      return {
        success: false,
        durationMs: Date.now() - t0,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  async printTest(): Promise<PrintResult> {
    return this.printReceipt(buildTestPayload());
  }

  async openCashDrawer(): Promise<void> {
    if (this.driver.kickDrawer) {
      await this.driver.kickDrawer();
    }
  }

  shouldAutoPrintOnSale(): boolean {
    return this.config?.autoPrintOnSale ?? false;
  }

  shouldOpenDrawerOnSale(): boolean {
    return this.config?.openCashDrawerOnSale ?? false;
  }

  getCopies(): number {
    return this.config?.copies ?? 1;
  }
}

function buildTestPayload(): ReceiptPayload {
  return {
    version: '1.0',
    docType: 'test',
    docNumber: 'TEST-0001',
    issuedAt: new Date().toISOString(),
    currency: 'KES',
    store: {
      name: 'Printer Test',
      slug: null,
      address: 'If you can read this, the printer works.',
      phone: null,
      email: null,
      taxId: null,
      logoUrl: null,
      website: null,
      taxLabel: 'VAT',
      receiptFooter: 'Test receipt — please ignore',
    },
    cashier: 'System',
    customer: null,
    items: [
      { name: 'Test Item A', qty: 1, unitPrice: 100, lineTotal: 100 },
      { name: 'Test Item B', qty: 2, unitPrice: 50, lineTotal: 100 },
    ],
    totals: {
      subtotal: 200,
      discount: 0,
      tax: 32,
      vatRate: 16,
      vatAmount: 32,
      total: 232,
      amountPaid: 250,
      change: 18,
    },
    payments: [{ method: 'cash', amount: 250, reference: null, paidAt: new Date().toISOString() }],
    footer: 'Test print successful',
    taxLabel: 'VAT',
  };
}

export const hardware = new HardwareManager();