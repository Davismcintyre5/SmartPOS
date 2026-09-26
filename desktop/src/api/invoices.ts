import { api } from './axios';
import type {
  Invoice,
  PublicInvoice,
  CreateInvoiceInput,
  RecordInvoicePaymentInput,
  ListInvoicesParams,
} from '@/types/invoice';
import type { ApiPaginated } from '@/types/api';

export const invoiceApi = {
  list: (params: ListInvoicesParams = {}) =>
    api
      .get<ApiPaginated<Invoice>>('/client/invoices', { params })
      .then((r) => r.data),

  get: (id: string) =>
    api.get<{ data: Invoice }>(`/client/invoices/${id}`).then((r) => r.data.data),

  create: (payload: CreateInvoiceInput) =>
    api
      .post<{ data: Invoice }>('/client/invoices', payload)
      .then((r) => r.data.data),

  update: (id: string, payload: Partial<CreateInvoiceInput>) =>
    api
      .patch<{ data: Invoice }>(`/client/invoices/${id}`, payload)
      .then((r) => r.data.data),

  send: (id: string) =>
    api
      .post<{ data: Invoice }>(`/client/invoices/${id}/send`)
      .then((r) => r.data.data),

  recordPayment: (id: string, payload: RecordInvoicePaymentInput) =>
    api
      .post<{ data: Invoice }>(`/client/invoices/${id}/payment`, payload)
      .then((r) => r.data.data),

  cancel: (id: string, reason: string) =>
    api
      .post<{ data: Invoice }>(`/client/invoices/${id}/cancel`, { reason })
      .then((r) => r.data.data),

  remind: (id: string) =>
    api
      .post<{ data: { sent: boolean; remindersSent: number } }>(
        `/client/invoices/${id}/remind`
      )
      .then((r) => r.data.data),

  pdf: (id: string) =>
    api
      .get<{ data: { url: string | null } }>(`/client/invoices/${id}/pdf`)
      .then((r) => r.data.data),
};

export const publicInvoiceApi = {
  get: (number: string) =>
    api
      .get<{ data: PublicInvoice }>(`/public/invoices/${number}`)
      .then((r) => r.data.data),
};