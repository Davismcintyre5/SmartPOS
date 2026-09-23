export type PaymentMethodCode =
  | 'cash'
  | 'card'
  | 'mpesa'
  | 'mpesa_send'
  | 'mpesa_till'
  | 'mpesa_paybill'
  | 'mpesa_stk'
  | 'stripe'
  | 'paystack'
  | 'flutterwave'
  | 'bank_transfer'
  | 'bank'
  | 'store_credit';

export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded';

export interface Payment {
  _id: string;
  tenantId: string;
  saleId?: string | null;
  invoiceId?: string | null;
  method: PaymentMethodCode | string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  providerRef?: string | null;
  providerPayload?: Record<string, unknown> | null;
  refundedAt?: string | null;
  refundedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InitiatePaymentInput {
  saleId?: string;
  method: string;
  phone?: string;
  amount?: number;
}

export interface RecordManualPaymentInput {
  saleId: string;
  method: string;
  amount?: number;
  reference?: string;
  note?: string;
  amountReceived?: number;
}