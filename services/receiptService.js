const Sale = require('../models/client/Sale');
const Invoice = require('../models/client/Invoice');
const Payment = require('../models/client/Payment');
const Tenant = require('../models/admin/Tenant');
const User = require('../models/client/User');
const { ApiError } = require('../utils/apiError');
const { env } = require('../config/env');

function money(n) {
  return Number(Number(n || 0).toFixed(2));
}

function storeBlock(tenant) {
  const s = tenant?.settings || {};
  return {
    name: tenant?.name || 'Store',
    slug: tenant?.slug || null,
    address: s.address || null,
    phone: s.phone || null,
    email: s.email || null,
    taxId: s.taxId || s.kraPin || null,
    logoUrl: s.logoUrl || null,
    website: s.website || null,
    taxLabel: s.taxLabel || 'VAT',
    receiptFooter: s.receiptFooter || 'Thank you for your business!',
  };
}

async function buildSaleReceipt(saleId, tenantId) {
  const sale = await Sale.findOne({ _id: saleId, tenantId }).lean();
  if (!sale) throw ApiError.notFound('SALE_NOT_FOUND', 'Sale not found');

  const tenant = await Tenant.findById(tenantId).lean();

  let cashierName = null;
  if (sale.cashierId) {
    const u = await User.findById(sale.cashierId).select('fullName').lean();
    cashierName = u?.fullName || null;
  }

  const paymentsRaw = await Payment.find({
    tenantId,
    saleId: sale._id,
    status: 'success',
  })
    .select('method amount providerRef mpesaReceipt paidAt createdAt')
    .lean();

  const payments = paymentsRaw.map((p) => ({
    method: p.method,
    amount: money(p.amount),
    reference: p.mpesaReceipt || p.providerRef || null,
    paidAt: p.paidAt || p.createdAt || null,
  }));

  const store = storeBlock(tenant);

  return {
    version: '1.0',
    docType: 'sale_receipt',
    docId: String(sale._id),
    docNumber: sale.saleNumber,
    issuedAt: sale.createdAt,
    currency: sale.currency || 'KES',
    voided: Boolean(sale.voided),

    store,

    cashier: cashierName,
    customer: sale.customerName ? { name: sale.customerName } : null,
    loyaltyCardNumber: sale.loyaltyCardNumber || null,

    items: (sale.items || []).map((i) => ({
      name: i.name || 'Item',
      sku: i.sku || null,
      qty: i.qty,
      unitPrice: money(i.price),
      lineTotal: money(i.subtotal),
    })),

    totals: {
      subtotal: money(sale.subtotal),
      discount: money(sale.discount || 0),
      tax: money(sale.tax || 0),
      vatRate: Number(sale.vatRate || 0),
      vatAmount: money(sale.vatAmount || 0),
      total: money(sale.total),
      amountPaid: money(sale.amountPaid || sale.total),
      change: money(sale.changeAmount || 0),
    },

    payments,

    qrUrl: `${env.appUrl}/r/${sale.saleNumber}`,
    footer: store.receiptFooter,
    taxLabel: store.taxLabel,
  };
}

async function buildInvoiceReceipt(invoiceId, tenantId) {
  const invoice = await Invoice.findOne({ _id: invoiceId, tenantId }).lean();
  if (!invoice) throw ApiError.notFound('INVOICE_NOT_FOUND', 'Invoice not found');

  const tenant = await Tenant.findById(tenantId).lean();
  const store = storeBlock(tenant);

  return {
    version: '1.0',
    docType: 'invoice_receipt',
    docId: String(invoice._id),
    docNumber: invoice.invoiceNumber,
    issuedAt: invoice.issuedAt || invoice.createdAt,
    dueDate: invoice.dueDate || null,
    currency: invoice.currency || 'KES',

    store,

    customer: invoice.customerSnapshot
      ? {
          name: invoice.customerSnapshot.name,
          phone: invoice.customerSnapshot.phone || null,
          email: invoice.customerSnapshot.email || null,
          address: invoice.customerSnapshot.address || null,
        }
      : null,

    items: (invoice.items || []).map((i) => ({
      name: i.name,
      description: i.description || null,
      qty: i.qty,
      unitPrice: money(i.unitPrice),
      lineTotal: money(i.subtotal),
    })),

    totals: {
      subtotal: money(invoice.subtotal),
      discount: money(invoice.discount || 0),
      tax: money(invoice.tax || 0),
      total: money(invoice.total),
      amountPaid: money(invoice.amountPaid || 0),
      amountDue: money(invoice.amountDue),
    },

    status: invoice.status,
    notes: invoice.notes || null,
    qrUrl: `${env.appUrl}/invoice/${invoice.invoiceNumber}`,
    footer: store.receiptFooter,
    taxLabel: store.taxLabel,
  };
}

module.exports = {
  buildSaleReceipt,
  buildInvoiceReceipt,
};