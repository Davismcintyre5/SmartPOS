import { syncApi } from './api.js';
import { prepare, transaction } from './database.js';
import { createLogger } from '../logger.js';

const log = createLogger('sync:pull');

const stmtUpsertProduct = () =>
  prepare(`
    INSERT INTO products
      (id, name, sku, barcode, category, price, cost, stock,
       low_stock_threshold, image_url, active, updated_at)
    VALUES
      (@id, @name, @sku, @barcode, @category, @price, @cost, @stock,
       @low_stock_threshold, @image_url, @active, @updated_at)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      sku = excluded.sku,
      barcode = excluded.barcode,
      category = excluded.category,
      price = excluded.price,
      cost = excluded.cost,
      stock = excluded.stock,
      low_stock_threshold = excluded.low_stock_threshold,
      image_url = excluded.image_url,
      active = excluded.active,
      updated_at = excluded.updated_at
  `);

const stmtUpsertCategory = () =>
  prepare(`
    INSERT INTO categories (id, name, position, updated_at)
    VALUES (@id, @name, @position, @updated_at)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      position = excluded.position,
      updated_at = excluded.updated_at
  `);

const stmtUpsertCustomer = () =>
  prepare(`
    INSERT INTO customers
      (id, name, phone, email, address, loyalty_card_number,
       total_spent, loyalty_points, visit_count, last_purchase_at,
       active, updated_at)
    VALUES
      (@id, @name, @phone, @email, @address, @loyalty_card_number,
       @total_spent, @loyalty_points, @visit_count, @last_purchase_at,
       @active, @updated_at)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      phone = excluded.phone,
      email = excluded.email,
      address = excluded.address,
      loyalty_card_number = excluded.loyalty_card_number,
      total_spent = excluded.total_spent,
      loyalty_points = excluded.loyalty_points,
      visit_count = excluded.visit_count,
      last_purchase_at = excluded.last_purchase_at,
      active = excluded.active,
      updated_at = excluded.updated_at
  `);

const stmtUpsertStaff = () =>
  prepare(`
    INSERT INTO staff (id, full_name, role, active, updated_at)
    VALUES (@id, @full_name, @role, @active, @updated_at)
    ON CONFLICT(id) DO UPDATE SET
      full_name = excluded.full_name,
      role = excluded.role,
      active = excluded.active,
      updated_at = excluded.updated_at
  `);

const stmtUpsertSetting = () =>
  prepare(`
    INSERT INTO settings (key, value, updated_at)
    VALUES (@key, @value, @updated_at)
    ON CONFLICT(key) DO UPDATE SET
      value = excluded.value,
      updated_at = excluded.updated_at
  `);

const stmtUpsertSyncState = () =>
  prepare(`
    INSERT INTO sync_state (key, value, updated_at)
    VALUES (@key, @value, @updated_at)
    ON CONFLICT(key) DO UPDATE SET
      value = excluded.value,
      updated_at = excluded.updated_at
  `);

const stmtGetSyncState = () =>
  prepare('SELECT value FROM sync_state WHERE key = ?');

const stmtDeleteProduct = () => prepare('DELETE FROM products WHERE id = ?');
const stmtDeleteCategory = () => prepare('DELETE FROM categories WHERE id = ?');
const stmtDeleteCustomer = () => prepare('DELETE FROM customers WHERE id = ?');
const stmtDeleteStaff = () => prepare('DELETE FROM staff WHERE id = ?');

const stmtUpsertSale = () =>
  prepare(`
    INSERT INTO sales_cache
      (id, sale_number, total, currency, payment_method, customer_name, created_at)
    VALUES
      (@id, @sale_number, @total, @currency, @payment_method, @customer_name, @created_at)
    ON CONFLICT(id) DO UPDATE SET
      sale_number = excluded.sale_number,
      total = excluded.total,
      currency = excluded.currency,
      payment_method = excluded.payment_method,
      customer_name = excluded.customer_name,
      created_at = excluded.created_at
  `);

const stmtDeleteSaleItems = () =>
  prepare('DELETE FROM sales_cache_items WHERE sale_id = ?');

const stmtInsertSaleItem = () =>
  prepare(`
    INSERT OR REPLACE INTO sales_cache_items
      (sale_id, product_id, name, qty, price, subtotal)
    VALUES
      (@sale_id, @product_id, @name, @qty, @price, @subtotal)
  `);

function nowIso() {
  return new Date().toISOString();
}

export function getLastPullAt() {
  const row = stmtGetSyncState().get('lastPullAt');
  return row?.value || '1970-01-01T00:00:00.000Z';
}

export function setLastPullAt(iso) {
  stmtUpsertSyncState().run({
    key: 'lastPullAt',
    value: iso,
    updated_at: nowIso(),
  });
}

const applyProducts = transaction((products) => {
  const stmt = stmtUpsertProduct();
  for (const p of products) {
    stmt.run({
      id: String(p._id),
      name: p.name || '',
      sku: p.sku || null,
      barcode: p.barcode || null,
      category: p.category || null,
      price: Math.round(Number(p.price) || 0),
      cost: Math.round(Number(p.cost) || 0),
      stock: Math.round(Number(p.stock) || 0),
      low_stock_threshold: Number(p.lowStockThreshold ?? 5),
      image_url: p.imageUrl || null,
      active: p.active !== false ? 1 : 0,
      updated_at: p.updatedAt || nowIso(),
    });
  }
});

const applyCategories = transaction((categories) => {
  const stmt = stmtUpsertCategory();
  for (const c of categories) {
    stmt.run({
      id: String(c._id),
      name: c.name || '',
      position: Number(c.position) || 0,
      updated_at: c.updatedAt || nowIso(),
    });
  }
});

const applyCustomers = transaction((customers) => {
  const stmt = stmtUpsertCustomer();
  for (const c of customers) {
    stmt.run({
      id: String(c._id),
      name: c.name || '',
      phone: c.phone || null,
      email: c.email || null,
      address: c.address || null,
      loyalty_card_number: c.loyaltyCardNumber || null,
      total_spent: Math.round(Number(c.totalSpent) || 0),
      loyalty_points: Math.round(Number(c.loyaltyPoints) || 0),
      visit_count: Math.round(Number(c.visitCount) || 0),
      last_purchase_at: c.lastPurchaseAt || null,
      active: c.active !== false ? 1 : 0,
      updated_at: c.updatedAt || nowIso(),
    });
  }
});

const applyStaff = transaction((staff) => {
  const stmt = stmtUpsertStaff();
  for (const s of staff) {
    stmt.run({
      id: String(s._id),
      full_name: s.fullName || '',
      role: s.role || 'cashier',
      active: s.active !== false ? 1 : 0,
      updated_at: s.updatedAt || nowIso(),
    });
  }
});

const applySettings = transaction((settings) => {
  const stmt = stmtUpsertSetting();
  const ts = nowIso();
  for (const [key, value] of Object.entries(settings || {})) {
    stmt.run({
      key,
      value: JSON.stringify(value),
      updated_at: ts,
    });
  }
});

const applyTombstones = transaction((tombstones) => {
  for (const id of tombstones.products || []) stmtDeleteProduct().run(id);
  for (const id of tombstones.categories || []) stmtDeleteCategory().run(id);
  for (const id of tombstones.customers || []) stmtDeleteCustomer().run(id);
  for (const id of tombstones.staff || []) stmtDeleteStaff().run(id);
});

const applyStock = transaction((branchStock) => {
  const stmt = prepare('UPDATE products SET stock = ? WHERE id = ?');
  for (const s of branchStock || []) {
    stmt.run(Math.round(Number(s.stock) || 0), String(s.productId));
  }
});

const applySales = transaction((sales) => {
  const saleStmt = stmtUpsertSale();
  const deleteItems = stmtDeleteSaleItems();
  const insertItem = stmtInsertSaleItem();

  for (const s of sales || []) {
    const saleId = String(s._id);
    saleStmt.run({
      id: saleId,
      sale_number: s.saleNumber || '',
      total: Math.round(Number(s.total) || 0),
      currency: s.currency || 'KES',
      payment_method: s.paymentMethod || null,
      customer_name: s.customerName || null,
      created_at: s.createdAt || nowIso(),
    });

    deleteItems.run(saleId);

    for (const item of s.items || []) {
      insertItem.run({
        sale_id: saleId,
        product_id: item.productId ? String(item.productId) : null,
        name: item.name || '',
        qty: Math.round(Number(item.qty) || 0),
        price: Math.round(Number(item.price) || 0),
        subtotal: Math.round(Number(item.subtotal) || 0),
      });
    }
  }
});

export async function pullCatalog({ branchId, deviceId, force = false }) {
  const since = force ? '1970-01-01T00:00:00.000Z' : getLastPullAt();

  log.info(`Pulling since ${since}`);
  const started = Date.now();

  const data = await syncApi.pull({ since, branchId, deviceId });
  const duration = Date.now() - started;

  const products = data.products || [];
  const categories = data.categories || [];
  const customers = data.customers || [];
  const staff = data.staff || [];
  const settings = data.settings || {};
  const branchStock = data.branchStock || [];
  const recentSales = data.recentSales || [];
  const tombstones = data.tombstones || {};

  if (products.length) applyProducts(products);
  if (categories.length) applyCategories(categories);
  if (customers.length) applyCustomers(customers);
  if (staff.length) applyStaff(staff);
  if (Object.keys(settings).length) applySettings(settings);
  if (branchStock.length) applyStock(branchStock);
  if (recentSales.length) applySales(recentSales);
  applyTombstones(tombstones);

  if (data.serverTime) setLastPullAt(data.serverTime);

  log.info(
    `Pull done in ${duration}ms — products:${products.length} cats:${categories.length} customers:${customers.length} staff:${staff.length} stock:${branchStock.length} sales:${recentSales.length}`
  );

  return {
    ok: true,
    serverTime: data.serverTime,
    counts: {
      products: products.length,
      categories: categories.length,
      customers: customers.length,
      staff: staff.length,
      branchStock: branchStock.length,
      recentSales: recentSales.length,
    },
  };
}

export function getCachedProducts() {
  return prepare('SELECT * FROM products WHERE active = 1 ORDER BY name ASC').all();
}

export function getCachedCustomers() {
  return prepare('SELECT * FROM customers WHERE active = 1 ORDER BY name ASC').all();
}

export function getCachedSettings() {
  const rows = prepare('SELECT key, value FROM settings').all();
  const out = {};
  for (const row of rows) {
    try {
      out[row.key] = JSON.parse(row.value);
    } catch {
      out[row.key] = row.value;
    }
  }
  return out;
}

export function getCachedRecentSales(limit = 100) {
  const sales = prepare(
    'SELECT * FROM sales_cache ORDER BY created_at DESC LIMIT ?'
  ).all(limit);

  if (sales.length === 0) return [];

  const itemsStmt = prepare(
    'SELECT * FROM sales_cache_items WHERE sale_id = ?'
  );

  return sales.map((s) => ({
    id: s.id,
    saleNumber: s.sale_number,
    total: Number(s.total) || 0,
    currency: s.currency,
    paymentMethod: s.payment_method,
    customerName: s.customer_name,
    createdAt: s.created_at,
    items: itemsStmt.all(s.id).map((i) => ({
      productId: i.product_id,
      name: i.name,
      qty: Number(i.qty) || 0,
      price: Number(i.price) || 0,
      subtotal: Number(i.subtotal) || 0,
    })),
  }));
}

export function getLastPullTime() {
  return getLastPullAt();
}