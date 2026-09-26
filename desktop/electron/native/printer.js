import { printer as ThermalPrinter, types as PrinterTypes } from 'node-thermal-printer';
import { BrowserWindow } from 'electron';
import { createLogger } from '../logger.js';
import { get } from '../store/index.js';
import { KEYS } from '../store/keys.js';

const log = createLogger('native:printer');

const PRINTER_TYPES = {
  epson: PrinterTypes.EPSON,
  star: PrinterTypes.STAR,
  'tanca': PrinterTypes.TANCA,
  'drauma': PrinterTypes.DRAUMA,
};

function buildPrinterConfig() {
  const printerName = get(KEYS.PRINTER_NAME, '') || '';
  const width = Number(get(KEYS.PRINTER_WIDTH, 80)) || 80;

  if (!printerName) {
    throw new Error('No printer configured');
  }

  const interfaceType = process.platform === 'win32' ? 'printer' : 'printer';
  const iface = `${interfaceType}:${printerName}`;

  return {
    type: PRINTER_TYPES.epson,
    interface: iface,
    characterSet: 'PC437_USA',
    removeSpecialCharacters: false,
    lineCharacter: '-',
    width,
    options: {
      timeout: 5000,
    },
  };
}

export function createPrinter() {
  const config = buildPrinterConfig();
  const printer = new ThermalPrinter(config);

  const isConnected = printer.isPrinterConnected();
  if (!isConnected) {
    log.warn('Printer not reachable:', config.interface);
  }

  return printer;
}

export async function printReceipt(sale, options = {}) {
  const printer = createPrinter();

  await printer.alignCenter();
  await printer.bold(true);
  await printer.setTextSize(1, 1);
  await printer.println(options.businessName || 'SmartPOS');
  await printer.setTextSize(0, 0);
  await printer.bold(false);

  if (options.address) await printer.println(options.address);
  if (options.phone) await printer.println(options.phone);

  await printer.drawLine();
  await printer.alignLeft();
  await printer.println(`Receipt: ${sale.saleNumber}`);
  await printer.println(`Date:    ${new Date(sale.createdAt || Date.now()).toLocaleString()}`);
  if (sale.customerName) await printer.println(`Customer: ${sale.customerName}`);
  if (sale.cashierName) await printer.println(`Cashier:  ${sale.cashierName}`);

  await printer.drawLine();

  for (const item of sale.items) {
    const name = String(item.name || '').slice(0, 32);
    const qty = item.qty;
    const price = Math.round(item.price || 0);
    const subtotal = Math.round(item.subtotal || qty * price);

    await printer.println(name);
    await printer.leftRight(`  ${qty} x ${price}`, `${subtotal}`);
  }

  await printer.drawLine();
  await printer.alignRight();

  const currency = sale.currency || 'KES';
  if (sale.subtotal !== undefined) {
    await printer.println(`Subtotal: ${currency} ${Math.round(sale.subtotal)}`);
  }
  if (sale.discount > 0) {
    await printer.println(`Discount: -${currency} ${Math.round(sale.discount)}`);
  }
  if (sale.vatAmount > 0) {
    await printer.println(`VAT:      ${currency} ${Math.round(sale.vatAmount)}`);
  }

  await printer.bold(true);
  await printer.setTextSize(1, 1);
  await printer.println(`TOTAL: ${currency} ${Math.round(sale.total)}`);
  await printer.setTextSize(0, 0);
  await printer.bold(false);

  if (sale.amountPaid !== undefined) {
    await printer.println(`Paid:  ${currency} ${Math.round(sale.amountPaid)}`);
  }
  if (sale.changeAmount > 0) {
    await printer.println(`Change: ${currency} ${Math.round(sale.changeAmount)}`);
  }
  if (sale.paymentMethod) {
    await printer.println(`Method: ${sale.paymentMethod}`);
  }

  await printer.alignCenter();
  await printer.newLine();
  await printer.println(options.footer || 'Thank you for shopping with us!');
  await printer.newLine();
  await printer.newLine();
  await printer.cut();

  try {
    await printer.execute();
    log.info('Receipt printed:', sale.saleNumber);
    return { ok: true };
  } catch (err) {
    log.error('Print failed:', err.message);
    throw err;
  }
}

export async function printTest() {
  const printer = createPrinter();
  await printer.alignCenter();
  await printer.bold(true);
  await printer.println('SmartPOS');
  await printer.bold(false);
  await printer.println('Printer test OK');
  await printer.println(new Date().toLocaleString());
  await printer.newLine();
  await printer.newLine();
  await printer.cut();

  await printer.execute();
  return { ok: true };
}

export async function listPrinters() {
  try {
    const { getPrinters } = await import('electron').then((m) => ({
      getPrinters: m.default?.webContents?.getAllWebContents
        ? null
        : null,
    }));

    const win = BrowserWindow.getAllWindows()[0];
    if (!win) return [];

    const printers = await win.webContents.getPrintersAsync();
    return printers.map((p) => ({
      name: p.name,
      displayName: p.displayName,
      description: p.description,
      status: p.status,
      isDefault: p.isDefault,
    }));
  } catch (err) {
    log.error('listPrinters failed:', err.message);
    return [];
  }
}