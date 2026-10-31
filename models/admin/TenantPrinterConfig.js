const mongoose = require('mongoose');

const CONNECTION_TYPES = ['usb', 'network', 'bluetooth', 'serial'];
const PRINTER_TYPES = ['thermal_58mm', 'thermal_80mm', 'laser', 'label'];
const CLIENT_TYPES = ['desktop', 'web', 'mobile'];

const DRIVER_MODES = [
  'browser_print',
  'thermal_usb',
  'thermal_relay',
  'thermal_ble',
  'none',
];

const SCANNER_MODES = ['keyboard_wedge', 'camera', 'bluetooth'];
const SCANNER_SUFFIX = ['Enter', 'Tab', 'None'];

const DRAWER_MODES = ['via_printer', 'usb', 'serial', 'none'];
const DRAWER_KICKS = ['ESC_P', 'ESC_p', 'custom'];

const schema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    deviceId: { type: String, required: true },
    clientType: { type: String, enum: CLIENT_TYPES, required: true },
    deviceLabel: { type: String, default: null },

    driverMode: {
      type: String,
      enum: DRIVER_MODES,
      default: 'browser_print',
    },

    receiptPrinter: {
      name: { type: String, default: null },
      type: { type: String, enum: PRINTER_TYPES, default: 'thermal_80mm' },
      connection: { type: String, enum: CONNECTION_TYPES, default: 'usb' },
      identifier: { type: String, default: null },
      charWidth: { type: Number, default: 48 },
      enabled: { type: Boolean, default: false },
    },

    labelPrinter: {
      name: { type: String, default: null },
      type: { type: String, enum: PRINTER_TYPES, default: null },
      connection: { type: String, enum: CONNECTION_TYPES, default: null },
      identifier: { type: String, default: null },
      charWidth: { type: Number, default: 32 },
      enabled: { type: Boolean, default: false },
    },

    scanner: {
      mode: { type: String, enum: SCANNER_MODES, default: 'keyboard_wedge' },
      identifier: { type: String, default: null },
      suffix: { type: String, enum: SCANNER_SUFFIX, default: 'Enter' },
      minLength: { type: Number, default: 4 },
      maxInterKeyMs: { type: Number, default: 50 },
    },

    cashDrawer: {
      mode: { type: String, enum: DRAWER_MODES, default: 'via_printer' },
      kickCommand: { type: String, enum: DRAWER_KICKS, default: 'ESC_P' },
      identifier: { type: String, default: null },
    },

    relayUrl: { type: String, default: 'http://localhost:9100' },

    autoPrintOnSale: { type: Boolean, default: true },
    copies: { type: Number, default: 1, min: 1, max: 5 },
    openCashDrawerOnSale: { type: Boolean, default: true },
  },
  { timestamps: true }
);

schema.index({ tenantId: 1, deviceId: 1 }, { unique: true });
schema.index({ tenantId: 1, clientType: 1 });

schema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('TenantPrinterConfig', schema);