import { api } from './axios';
import type {
  PaymentMethod,
  UpdatePaymentMethodPayload,
} from '@/types/paymentMethod';

export const paymentMethodApi = {
  list: () =>
    api
      .get<{ data: PaymentMethod[] }>('/admin/payment-methods')
      .then((r) => r.data.data),

  update: (id: string, payload: UpdatePaymentMethodPayload) =>
    api
      .patch<{ data: PaymentMethod }>(`/admin/payment-methods/${id}`, payload)
      .then((r) => r.data.data),
};