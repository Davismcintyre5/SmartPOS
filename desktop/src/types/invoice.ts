export const INVOICE_STATUSES = [
  'draft',
  'sent',
  'partial',
  'paid',
  'overdue',
  'cancelled',
] as const;

export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export interface InvoiceItem {
  productId: string | null;
  name: string;
  description?: string | null;
  qty: number;
  unitPrice: number;
  subtotal: number;
}

export interface CustomerSnapshot {
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
}

export interface PaymentInstruction {
  method: string;
  title: string;
  description?: string | null;
  steps?: string[];
  payTo?: string | null;
  code?: string;
  recipient?: Record<string, string | number | null>;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string | null;
  customerSnapshot: CustomerSnapshot;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  currency: string;
  status: InvoiceStatus;
  dueDate?: string | null;
  issuedAt?: string | null;
  sentAt?: string | null;
  paidAt?: string | null;
  cancelledAt?: string | null;
  cancelReason?: string | null;
  paymentMethod?: string | null;
  paymentRef?: string | null;
  notes?: string | null;
  remindersSent: number;
  lastReminderAt?: string | null;
  pdfUrl?: string | null;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoiceInput {
  customerId?: string;
  customerSnapshot?: CustomerSnapshot;
  items: Array<{
    productId?: string;
    name: string;
    description?: string;
    qty: number;
    unitPrice: number;
  }>;
  discount?: number;
  tax?: number;
  dueDate?: string;
  notes?: string;
  paymentInstructions?: PaymentInstruction[];
}

export interface RecordInvoicePaymentInput {
  amount: number;
  method: string;
  reference?: string;
  note?: string;
}

export interface ListInvoicesParams {
  page?: number;
  limit?: number;
  status?: InvoiceStatus;
  customerId?: string;
  search?: string;
  from?: string;
  to?: string;
}

export interface PublicInvoice {
  invoiceNumber: string;
  customerSnapshot: CustomerSnapshot;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  currency: string;
  status: string;
  issuedAt: string;
  dueDate: string;
  notes?: string | null;
  paymentInstructions: PaymentInstruction[];
}