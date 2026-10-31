export interface ReceiptStore {
  name: string;
  slug: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  taxId: string | null;
  logoUrl: string | null;
  website: string | null;
  taxLabel: string;
  receiptFooter: string;
}

export interface ReceiptItem {
  name: string;
  sku?: string | null;
  description?: string | null;
  qty: number;
  unitPrice: number;
  lineTotal: number;
}

export interface ReceiptTotals {
  subtotal: number;
  discount: number;
  tax: number;
  vatRate?: number;
  vatAmount?: number;
  total: number;
  amountPaid: number;
  change: number;
  amountDue?: number;
}

export interface ReceiptPayment {
  method: string;
  amount: number;
  reference: string | null;
  paidAt: string | null;
}

export interface ReceiptPayload {
  version: string;
  docType: 'sale_receipt' | 'invoice_receipt' | 'test';
  docId?: string;
  docNumber: string;
  issuedAt: string;
  currency: string;
  voided?: boolean;
  store: ReceiptStore;
  cashier?: string | null;
  customer?: {
    name: string;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
  } | null;
  loyaltyCardNumber?: string | null;
  items: ReceiptItem[];
  totals: ReceiptTotals;
  payments: ReceiptPayment[];
  qrUrl?: string;
  footer: string;
  taxLabel: string;
  notes?: string | null;
  status?: string;
}

export type PrinterDriverMode =
  | 'browser_print'
  | 'thermal_usb'
  | 'thermal_relay'
  | 'thermal_ble'
  | 'none';

export type PrinterType = 'thermal_58mm' | 'thermal_80mm' | 'laser' | 'label';
export type PrinterConnection = 'usb' | 'network' | 'bluetooth' | 'serial';
export type ScannerMode = 'keyboard_wedge' | 'camera' | 'bluetooth';
export type ScannerSuffix = 'Enter' | 'Tab' | 'None';
export type DrawerMode = 'via_printer' | 'usb' | 'serial' | 'none';
export type DrawerKick = 'ESC_P' | 'ESC_p' | 'custom';
export type ClientType = 'desktop' | 'web' | 'mobile';

export interface PrinterSection {
  name: string | null;
  type: PrinterType;
  connection: PrinterConnection;
  identifier: string | null;
  charWidth: number;
  enabled: boolean;
}

export interface ScannerSection {
  mode: ScannerMode;
  identifier: string | null;
  suffix: ScannerSuffix;
  minLength: number;
  maxInterKeyMs: number;
}

export interface CashDrawerSection {
  mode: DrawerMode;
  kickCommand: DrawerKick;
  identifier: string | null;
}

export interface PrinterConfig {
  _id: string;
  tenantId: string;
  deviceId: string;
  clientType: ClientType;
  deviceLabel: string | null;
  driverMode: PrinterDriverMode;
  receiptPrinter: PrinterSection;
  labelPrinter: PrinterSection | null;
  scanner: ScannerSection;
  cashDrawer: CashDrawerSection;
  relayUrl: string;
  autoPrintOnSale: boolean;
  copies: number;
  openCashDrawerOnSale: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PrinterConfigInput {
  deviceId: string;
  clientType: ClientType;
  deviceLabel?: string | null;
  driverMode?: PrinterDriverMode;
  receiptPrinter?: Partial<PrinterSection>;
  labelPrinter?: Partial<PrinterSection> | null;
  scanner?: Partial<ScannerSection>;
  cashDrawer?: Partial<CashDrawerSection>;
  relayUrl?: string;
  autoPrintOnSale?: boolean;
  copies?: number;
  openCashDrawerOnSale?: boolean;
}

export interface PrintLogInput {
  clientType: ClientType;
  docType: 'sale_receipt' | 'invoice_receipt' | 'label' | 'test';
  docId?: string | null;
  docNumber?: string | null;
  printerName?: string | null;
  success: boolean;
  error?: string | null;
  durationMs?: number;
  deviceId?: string | null;
}