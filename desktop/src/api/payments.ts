import { api } from './axios';

export interface StkPushInput {
  phone: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  discount?: number;
  vatAmount?: number;
  customerName?: string;
}

export interface StkPushResponse {
  saleId: string;
  saleNumber: string;
  paymentId: string;
  checkoutRequestId: string;
  message: string;
  total: number;
  currency: string;
}

export type StkStatus = 'pending' | 'success' | 'failed' | 'refunded';

export interface StkStatusResponse {
  status: StkStatus;
  paymentId: string;
  saleId: string | null;
  saleNumber: string | null;
  amount: number;
  currency: string;
  receipt: string | null;
}

export const paymentApi = {
  stkPush: (payload: StkPushInput) =>
    api
      .post<{ data: StkPushResponse }>('/client/payments/stk', payload)
      .then((r) => r.data.data),

  stkStatus: (checkoutRequestId: string) =>
    api
      .get<{ data: StkStatusResponse }>(
        `/client/payments/stk/${checkoutRequestId}`
      )
      .then((r) => r.data.data),

  cancelStk: (checkoutRequestId: string) =>
    api
      .delete<{ data: { cancelled: boolean } }>(
        `/client/payments/stk/${checkoutRequestId}`
      )
      .then((r) => r.data.data),
};

export interface PublicStkInput {
  invoiceNumber: string;
  phone: string;
}

export interface PublicStkResponse {
  checkoutRequestId: string;
  message: string;
}

export interface PublicStkStatusResponse {
  status: StkStatus;
  invoiceNumber: string | null;
  invoiceStatus: string | null;
  amountPaid: number;
  amountDue: number;
  currency: string;
  receipt: string | null;
}

export const publicPaymentApi = {
  sendStkForInvoice: (payload: PublicStkInput) =>
    api
      .post<{ data: PublicStkResponse }>('/public/payments/stk/invoice', payload)
      .then((r) => r.data.data),

  stkStatus: (checkoutRequestId: string) =>
    api
      .get<{ data: PublicStkStatusResponse }>(
        `/public/payments/stk/status/${checkoutRequestId}`
      )
      .then((r) => r.data.data),
};