import { ipcMain } from 'electron';
import {
  getProducts,
  getCustomers,
  getSettings,
  refreshCatalog,
} from '../sync/index.js';
import { createLogger } from '../logger.js';

const log = createLogger('ipc:db');

function shapeProduct(row) {
  return {
    id: row.id,
    _id: row.id,
    name: row.name,
    sku: row.sku || null,
    barcode: row.barcode || null,
    category: row.category || null,
    price: Number(row.price) || 0,
    cost: Number(row.cost) || 0,
    stock: Number(row.stock) || 0,
    lowStockThreshold: Number(row.low_stock_threshold) || 0,
    imageUrl: row.image_url || null,
    imagePublicId: null,
    active: row.active === 1 || row.active === true,
    createdAt: row.updated_at,
    updatedAt: row.updated_at,
  };
}

function shapeCustomer(row) {
  return {
    id: row.id,
    _id: row.id,
    name: row.name,
    phone: row.phone || null,
    email: row.email || null,
    address: row.address || null,
    loyaltyCardNumber: row.loyalty_card_number || null,
    totalSpent: Number(row.total_spent) || 0,
    loyaltyPoints: Number(row.loyalty_points) || 0,
    visitCount: Number(row.visit_count) || 0,
    lastPurchaseAt: row.last_purchase_at || null,
    active: row.active === 1 || row.active === true,
    createdAt: row.updated_at,
    updatedAt: row.updated_at,
  };
}

export function registerDbIpc() {
  ipcMain.handle('db:getProducts', () => {
    try {
      const rows = getProducts();
      return { ok: true, products: rows.map(shapeProduct) };
    } catch (err) {
      log.error('getProducts failed:', err.message);
      return { ok: false, error: err.message, products: [] };
    }
  });

  ipcMain.handle('db:getCustomers', () => {
    try {
      const rows = getCustomers();
      return { ok: true, customers: rows.map(shapeCustomer) };
    } catch (err) {
      log.error('getCustomers failed:', err.message);
      return { ok: false, error: err.message, customers: [] };
    }
  });

  ipcMain.handle('db:getSettings', () => {
    try {
      return { ok: true, settings: getSettings() };
    } catch (err) {
      log.error('getSettings failed:', err.message);
      return { ok: false, error: err.message, settings: {} };
    }
  });

  ipcMain.handle('db:refreshCatalog', async () => {
    try {
      const result = await refreshCatalog();
      return { ok: true, ...result };
    } catch (err) {
      log.error('refreshCatalog failed:', err.message);
      return { ok: false, error: err.message };
    }
  });

  log.info('DB IPC registered');
}