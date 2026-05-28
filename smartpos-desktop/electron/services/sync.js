// electron/services/sync.js
const { getDatabase } = require("./database");
const axios = require("axios");

let syncInterval = null;

function startSyncEngine(apiClient) {
  console.log("Sync engine started");

  // Initial sync on startup
  performSync(apiClient);

  // Periodic sync every 30 seconds
  syncInterval = setInterval(() => {
    performSync(apiClient);
  }, 30000);
}

function stopSyncEngine() {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
}

async function performSync(apiClient) {
  const db = getDatabase();
  if (!db) return;

  try {
    // 1. Upload pending sales
    await uploadPendingSales(apiClient, db);

    // 2. Upload pending held sales
    await uploadPendingHeldSales(apiClient, db);

    // 3. Download latest products
    await downloadProducts(apiClient, db);

    // 4. Download latest customers
    await downloadCustomers(apiClient, db);

    console.log("Sync completed");
  } catch (err) {
    console.error("Sync failed:", err.message);
  }
}

async function uploadPendingSales(apiClient, db) {
  const pending = db.prepare("SELECT * FROM sales WHERE synced = 0").all();

  for (const sale of pending) {
    try {
      const items = JSON.parse(sale.items);
      const payload = {
        items: items.map((item) => ({
          productId: item.productId || item.product,
          quantity: item.quantity || 1,
          price: item.price || 0,
        })),
        paymentMethod: sale.payment_method,
        discount: sale.discount,
        vatRate: sale.vat_rate || 0,
        vatAmount: sale.vat_amount || 0,
        amountPaid: sale.amount_paid || sale.total,
        changeAmount: sale.change_amount || 0,
        customerName: sale.customer_name || "",
        loyaltyCardNumber: sale.loyalty_card || "",
        status: "completed",
      };

      const res = await apiClient.post("/client/pos/sale", payload);

      if (res.data?.success) {
        db.prepare("UPDATE sales SET synced = 1 WHERE id = ?").run(sale.id);
        console.log(`Sale ${sale.receipt} synced`);
      }
    } catch (err) {
      console.error(`Failed to sync sale ${sale.receipt}:`, err.message);
    }
  }
}

async function uploadPendingHeldSales(apiClient, db) {
  const pending = db.prepare("SELECT * FROM held_sales WHERE synced = 0").all();

  for (const held of pending) {
    try {
      const data = JSON.parse(held.data);
      const res = await apiClient.post("/client/pos/hold", data);

      if (res.data?.success) {
        db.prepare("UPDATE held_sales SET synced = 1 WHERE id = ?").run(held.id);
      }
    } catch (err) {
      console.error(`Failed to sync held sale ${held.id}:`, err.message);
    }
  }
}

async function downloadProducts(apiClient, db) {
  try {
    const res = await apiClient.get("/client/products", { params: { limit: 1000 } });
    const products = res.data?.data?.products || res.data?.products || res.products || [];

    const insert = db.prepare(`
      INSERT OR REPLACE INTO products (id, name, barcode, price, cost, stock, category, low_stock_threshold, synced, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now'))
    `);

    const transaction = db.transaction(() => {
      for (const p of products) {
        insert.run(p._id, p.name, p.barcode || "", p.price, p.cost || 0, p.stock, p.category || "", p.lowStockThreshold || 10);
      }
    });

    transaction();
  } catch (err) {
    console.error("Failed to download products:", err.message);
  }
}

async function downloadCustomers(apiClient, db) {
  try {
    const res = await apiClient.get("/client/customers", { params: { limit: 1000 } });
    const customers = res.data?.data?.customers || res.data?.customers || res.customers || [];

    const insert = db.prepare(`
      INSERT OR REPLACE INTO customers (id, name, phone, email, loyalty_card_number, loyalty_points, total_spent, visit_count, synced)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);

    const transaction = db.transaction(() => {
      for (const c of customers) {
        insert.run(c._id, c.name, c.phone || "", c.email || "", c.loyaltyCardNumber || "", c.loyaltyPoints || 0, c.totalSpent || 0, c.visitCount || 0);
      }
    });

    transaction();
  } catch (err) {
    console.error("Failed to download customers:", err.message);
  }
}

module.exports = { startSyncEngine, stopSyncEngine };