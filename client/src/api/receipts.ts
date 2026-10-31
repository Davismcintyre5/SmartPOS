import { api } from './axios';
import type { Sale } from '@/types/sale';
import type {
  PrinterConfig,
  PrinterConfigInput,
  PrintLogInput,
  ReceiptPayload,
  ClientType,
} from '@/types/receipt';

export interface ReceiptResponse {
  business: {
    name: string;
    logoUrl: string | null;
    address: string | null;
    phone: string | null;
  };
  sale: Sale;
  footer: string;
}

export interface PrintLogItem {
  _id: string;
  tenantId: string;
  deviceId: string | null;
  clientType: ClientType;
  docType: string;
  docId: string | null;
  docNumber: string | null;
  printerName: string | null;
  success: boolean;
  error: string | null;
  durationMs: number;
  createdAt: string;
  updatedAt: string;
}

export const receiptApi = {
  get: (saleId: string) =>
    api
      .get<{ data: ReceiptResponse }>(`/client/receipts/${saleId}`)
      .then((r) => r.data.data),

  pdf: (saleId: string) =>
    api
      .get<{ data: { url: string | null; message?: string } }>(
        `/client/receipts/${saleId}/pdf`
      )
      .then((r) => r.data.data),

  email: (saleId: string, to: string, customerName?: string) =>
    api
      .post(`/client/receipts/${saleId}/email`, { to, customerName })
      .then((r) => r.data.data),

  getStructuredSale: (saleId: string) =>
    api
      .get<{ data: ReceiptPayload }>(`/client/receipts/structured/sale/${saleId}`)
      .then((r) => r.data.data),

  getStructuredInvoice: (invoiceId: string) =>
    api
      .get<{ data: ReceiptPayload }>(
        `/client/receipts/structured/invoice/${invoiceId}`
      )
      .then((r) => r.data.data),

  getPrinterConfig: (deviceId: string) =>
    api
      .get<{ data: PrinterConfig | null }>(`/client/receipts/printers`, {
        params: { deviceId },
      })
      .then((r) => r.data.data),

  updatePrinterConfig: (payload: PrinterConfigInput) =>
    api
      .put<{ data: PrinterConfig }>(`/client/receipts/printers`, payload)
      .then((r) => r.data.data),

  listDevices: () =>
    api
      .get<{ data: PrinterConfig[] }>(`/client/receipts/printers/devices`)
      .then((r) => r.data.data),

  deleteDevice: (deviceId: string) =>
    api
      .delete(`/client/receipts/printers/devices/${deviceId}`)
      .then((r) => r.data),

  createPrintLog: (payload: PrintLogInput) =>
    api
      .post<{ data: PrintLogItem }>(`/client/receipts/logs`, payload)
      .then((r) => r.data.data),

  listPrintLogs: (limit = 50) =>
    api
      .get<{ data: PrintLogItem[] }>(`/client/receipts/logs`, {
        params: { limit },
      })
      .then((r) => r.data.data),
};