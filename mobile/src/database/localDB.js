// src/database/localDB.js
import * as SQLite from "expo-sqlite";

let db = null;

export async function initDatabase() {
  db = await SQLite.openDatabaseAsync("smartpos.db");

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, barcode TEXT,
      price REAL DEFAULT 0, stock INTEGER DEFAULT 0,
      category TEXT DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS sales (
      id TEXT PRIMARY KEY, receipt TEXT NOT NULL, items TEXT,
      subtotal REAL DEFAULT 0, discount REAL DEFAULT 0,
      total REAL DEFAULT 0, payment_method TEXT,
      customer_name TEXT DEFAULT '', status TEXT DEFAULT 'completed',
      synced INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS held_sales (
      id TEXT PRIMARY KEY, data TEXT NOT NULL,
      synced INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  return db;
}

export function getDatabase() {
  return db;
}

export async function saveSale(saleData) {
  if (!db) return;
  const id = `LOCAL-${Date.now()}`;
  await db.runAsync(
    `INSERT INTO sales (id, receipt, items, subtotal, discount, total, payment_method, customer_name, status, synced, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'completed', 0, datetime('now'))`,
    [id, saleData.receiptNumber || id, JSON.stringify(saleData.items || []),
     saleData.subtotal || 0, saleData.discount || 0, saleData.total || 0,
     saleData.paymentMethod || "cash", saleData.customerName || ""]
  );
  return { success: true, id };
}

export async function getPendingSyncs() {
  if (!db) return 0;
  const result = await db.getFirstAsync("SELECT COUNT(*) as count FROM sales WHERE synced = 0");
  return result?.count || 0;
}