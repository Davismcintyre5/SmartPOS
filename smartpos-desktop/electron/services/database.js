// electron/services/database.js
const initSqlJs = require("sql.js");
const path = require("path");
const fs = require("fs");
const { app } = require("electron");

let db = null;

async function initDatabase() {
  const SQL = await initSqlJs();
  const dbPath = path.join(app.getPath("userData"), "smartpos.db");

  // Load existing database or create new
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run("PRAGMA foreign_keys = ON");

  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, barcode TEXT,
      price REAL DEFAULT 0, cost REAL DEFAULT 0, stock INTEGER DEFAULT 0,
      category TEXT DEFAULT '', low_stock_threshold INTEGER DEFAULT 10,
      synced INTEGER DEFAULT 1, updated_at TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS sales (
      id TEXT PRIMARY KEY, receipt TEXT NOT NULL, items TEXT NOT NULL,
      subtotal REAL DEFAULT 0, discount REAL DEFAULT 0, total REAL DEFAULT 0,
      vat_rate REAL DEFAULT 0, vat_amount REAL DEFAULT 0,
      amount_paid REAL DEFAULT 0, change_amount REAL DEFAULT 0,
      payment_method TEXT NOT NULL, customer_name TEXT DEFAULT '',
      loyalty_card TEXT DEFAULT '', status TEXT DEFAULT 'completed',
      synced INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, phone TEXT, email TEXT,
      loyalty_card_number TEXT, loyalty_points INTEGER DEFAULT 0,
      total_spent REAL DEFAULT 0, visit_count INTEGER DEFAULT 0,
      synced INTEGER DEFAULT 1
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS held_sales (
      id TEXT PRIMARY KEY, data TEXT NOT NULL,
      synced INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)`);

  // Auto-save to disk
  function saveToDisk() {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }

  // Save every 30 seconds
  setInterval(saveToDisk, 30000);

  console.log("Database initialized at", dbPath);
  return db;
}

function getDatabase() {
  return db;
}

module.exports = { initDatabase, getDatabase };