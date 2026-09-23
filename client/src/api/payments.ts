import { api } from './axios';
import type { Payment, InitiatePaymentInput } from '@/types/payment';
import type { ApiPaginated } from '@/types/api';

export interface PublicPaymentMethod {
  code: string;
  label: string;
  mode: string;
  config: Record<string, unknown>;
}

export interface SendStkInput {
  invoiceNumber: string;
  phone: string;
}

export interface SendStkResponse {
  checkoutRequestId: string;
  message?: string;
}

export const paymentApi = {
  list: (
    params: {
      page?: number;
      limit?: number;
      saleId?: string;
      status?: string;
    } = {}
  ) =>
    api
      .get<ApiPaginated<Payment>>('/client/payments', { params })
      .then((r) => r.data),

  initiate: (payload: InitiatePaymentInput) =>
    api
      .post<{
        data: {
          paymentId: string;
          checkoutRequestId?: string;
          message?: string;
        };
      }>('/client/payments/initiate', payload)
      .then((r) => r.data.data),

  recordManual: (payload: {
    saleId: string;
    method: string;
    amount?: number;
    reference?: string;
    note?: string;
    amountReceived?: number;
  }) =>
    api
      .post<{ data: Payment }>('/client/payments/manual', payload)
      .then((r) => r.data.data),

  refund: (id: string, reason?: string) =>
    api
      .post<{ data: Payment }>(`/client/payments/${id}/refund`, { reason })
      .then((r) => r.data.data),
};

export const publicPaymentApi = {
  methods: () =>
    api
      .get<{ data: PublicPaymentMethod[] }>('/public/payments/methods')
      .then((r) => r.data.data),

  sendStkForInvoice: (payload: SendStkInput) =>
    api
      .post<{ data: SendStkResponse }>('/public/payments/stk/invoice', payload)
      .then((r) => r.data.data),
};