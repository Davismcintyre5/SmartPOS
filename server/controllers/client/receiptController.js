const Sale = require('../../models/client/Sale');
const Client = require('../../models/admin/Client');
const Settings = require('../../models/client/Settings');
const emailService = require('../../services/emailService');
const smsService = require('../../services/smsService');
const { success } = require('../../utils/response');
const { formatMoney } = require('../../utils/money');
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');

const getReceipt = asyncHandler(async (req, res) => {
  const sale = await Sale.findOne({ _id: req.params.saleId, tenantId: req.tenant._id }).lean();
  if (!sale) throw ApiError.notFound('Sale not found');

  const client = await Client.findById(req.tenant._id).lean();
  const settings = await Settings.findOne({ tenantId: req.tenant._id }).lean();

  const receipt = {
    saleId: sale._id,
    storeName: client.name,
    logoUrl: client.logoUrl,
    currency: sale.currency,
    items: sale.items.map((i) => ({
      ...i,
      priceFormatted: formatMoney(i.priceCents, sale.currency),
      totalFormatted: formatMoney(i.totalCents, sale.currency)
    })),
    subtotal: formatMoney(sale.subtotalCents, sale.currency),
    tax: formatMoney(sale.taxCents, sale.currency),
    discount: formatMoney(sale.discountCents, sale.currency),
    total: formatMoney(sale.totalCents, sale.currency),
    paymentMethod: sale.paymentMethod,
    createdAt: sale.createdAt,
    header: settings?.receiptHeader || '',
    footer: settings?.receiptFooter || ''
  };

  return success(res, receipt, 'Receipt');
});

const emailReceipt = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw ApiError.badRequest('email required');

  const sale = await Sale.findOne({ _id: req.params.saleId, tenantId: req.tenant._id }).lean();
  if (!sale) throw ApiError.notFound('Sale not found');

  await emailService.send({
    to: email,
    template: 'receipt',
    data: {
      storeName: req.tenant.name,
      saleId: sale._id,
      total: formatMoney(sale.totalCents, sale.currency),
      reference: sale._id.slice(0, 8)
    }
  }).catch(() => {});

  return success(res, null, 'Receipt emailed');
});

const smsReceipt = asyncHandler(async (req, res) => {
  const { phone } = req.body;
  if (!phone) throw ApiError.badRequest('phone required');

  const sale = await Sale.findOne({ _id: req.params.saleId, tenantId: req.tenant._id }).lean();
  if (!sale) throw ApiError.notFound('Sale not found');

  await smsService.send({
    to: phone,
    template: 'receipt',
    data: {
      storeName: req.tenant.name,
      saleId: sale._id,
      total: formatMoney(sale.totalCents, sale.currency),
      reference: sale._id.slice(0, 8)
    }
  }).catch(() => {});

  return success(res, null, 'Receipt sent via SMS');
});

const printReceipt = asyncHandler(async (req, res) => {
  const sale = await Sale.findOne({ _id: req.params.saleId, tenantId: req.tenant._id }).lean();
  if (!sale) throw ApiError.notFound('Sale not found');

  const lines = [];
  lines.push(req.tenant.name);
  lines.push(new Date(sale.createdAt).toLocaleString());
  lines.push('------------------------------');

  for (const item of sale.items) {
    lines.push(`${item.qty} x ${item.productName}  ${formatMoney(item.totalCents, sale.currency)}`);
  }

  lines.push('------------------------------');
  lines.push(`Total: ${formatMoney(sale.totalCents, sale.currency)}`);
  lines.push(`Payment: ${sale.paymentMethod}`);

  return success(res, { lines: lines.join('\n') }, 'ESC/POS payload');
});

module.exports = { getReceipt, emailReceipt, smsReceipt, printReceipt };