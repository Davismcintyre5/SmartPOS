import { api } from './axios';
import type { Sale } from '@/types/sale';

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
};