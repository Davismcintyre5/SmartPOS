// services/client/aiService.js
const AISettings = require("../../models/client/AISettings");
const env = require("../../config/env");
const logger = require("../../config/logger");
const axios = require("axios");
const Sale = require("../../models/client/Sale");
const Product = require("../../models/client/Product");
const Customer = require("../../models/client/Customer");

const BASE_URL = env.HDM_AI_BASE_URL || "https://hdmai-server.onrender.com/api/v1";
const API_KEY = env.HDM_AI_API_KEY || "";

const callAI = async (endpoint, payload) => {
  try {
    const { data } = await axios.post(`${BASE_URL}${endpoint}`, payload, {
      headers: { "x-api-key": API_KEY, "Content-Type": "application/json" },
      timeout: 15000,
    });
    return data;
  } catch (err) {
    logger.error("AI call failed", { endpoint, error: err.message });
    return { success: false, message: "AI service unavailable" };
  }
};

// Gather real business data for chat context
const gatherBusinessData = async (clientId, message) => {
  const msg = message.toLowerCase();
  const data = {};

  // Always include basic inventory
  if (msg.includes("stock") || msg.includes("inventory") || msg.includes("product") || msg.includes("low")) {
    const products = await Product.find({ clientId }).lean();
    data.inventory = products.map((p) => ({
      name: p.name,
      stock: p.stock,
      price: p.price,
      category: p.category || "Uncategorized",
      reorder_level: p.lowStockThreshold || 10,
    }));
  }

  // Include sales data for sales/revenue questions
  if (msg.includes("sale") || msg.includes("revenue") || msg.includes("today") || msg.includes("report") || msg.includes("month")) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sales = await Sale.find({
      clientId,
      status: "completed",
      createdAt: { $gte: today },
    }).lean();

    const totalSales = sales.reduce((sum, s) => sum + s.total, 0);
    const paymentMethods = {};
    sales.forEach((s) => {
      paymentMethods[s.paymentMethod] = (paymentMethods[s.paymentMethod] || 0) + s.total;
    });

    // Top products today
    const productSales = {};
    sales.forEach((s) => {
      s.items.forEach((item) => {
        productSales[item.name] = (productSales[item.name] || 0) + (item.total || item.price * item.quantity);
      });
    });
    const topProducts = Object.entries(productSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, total]) => ({ name, sales: total }));

    data.sales = {
      total_sales: totalSales,
      transactions: sales.length,
      top_products: topProducts,
      payment_methods: paymentMethods,
    };
  }

  // Include customer data
  if (msg.includes("customer") || msg.includes("loyalty") || msg.includes("client")) {
    const customers = await Customer.find({ clientId }).lean();
    data.customers = customers.map((c) => ({
      name: c.name,
      phone: c.phone,
      loyaltyPoints: c.loyaltyPoints || 0,
      totalSpent: c.totalSpent || 0,
      visitCount: c.visitCount || 0,
    }));
  }

  // Monthly overview
  if (msg.includes("month") || msg.includes("overview") || msg.includes("business") || msg.includes("performance")) {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const monthSales = await Sale.find({
      clientId,
      status: "completed",
      createdAt: { $gte: startOfMonth },
    }).lean();

    data.monthly = {
      total_sales: monthSales.reduce((sum, s) => sum + s.total, 0),
      transactions: monthSales.length,
      avg_transaction: monthSales.length > 0
        ? Math.round((monthSales.reduce((sum, s) => sum + s.total, 0) / monthSales.length) * 100) / 100
        : 0,
    };
  }

  return data;
};

const chat = async (clientId, message, userId) => {
  const settings = await AISettings.findOne({ clientId }).lean();
  if (!settings?.enabledFeatures?.posCommands && !settings?.useGlobalAI) {
    return "AI features are disabled. Enable them in Settings.";
  }

  // Gather real data based on the question
  const businessData = await gatherBusinessData(clientId, message);

  const payload = {
    message,
    client_id: clientId,
    business_id: clientId,
    conversation_id: null,
    data: businessData,
  };

  const res = await callAI("/smartpos/chat", payload);
  return res?.data?.reply || "I couldn't process that request. Please try again.";
};

const executeCommand = async (clientId, command) => {
  const settings = await AISettings.findOne({ clientId }).lean();
  if (!settings?.enabledFeatures?.posCommands) return { message: "NLP commands are disabled." };

  const payload = { command, business_id: clientId, parameters: {} };
  const res = await callAI("/smartpos/command", payload);
  return res?.data || { message: "Command failed." };
};

const getSalesAnalytics = async (clientId) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const sales = await Sale.find({ clientId, status: "completed", createdAt: { $gte: startOfMonth } }).lean();

  const totalSales = sales.reduce((s, r) => s + r.total, 0);
  const paymentMethods = {};
  sales.forEach((s) => { paymentMethods[s.paymentMethod] = (paymentMethods[s.paymentMethod] || 0) + s.total; });

  const productSales = {};
  sales.forEach((s) => s.items.forEach((i) => { productSales[i.name] = (productSales[i.name] || 0) + i.total; }));
  const topProducts = Object.entries(productSales).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, total]) => ({ name, sales: total }));

  const payload = {
    business_id: clientId,
    analytics_type: "sales",
    period: "this_month",
    data: { total_sales: totalSales, transactions: sales.length, top_products: topProducts, payment_methods: paymentMethods },
  };
  return callAI("/smartpos/analytics/sales", payload);
};

const getRestockForecast = async (clientId) => {
  const products = await Product.find({ clientId, stock: { $lte: 20 } }).lean();
  const stockData = products.map((p) => ({ product: p.name, stock: p.stock, daily_sales: 0, lead_time_days: 2 }));
  const payload = { business_id: clientId, forecast_type: "restock", period: "next_week", data: { current_stock: stockData } };
  return callAI("/smartpos/forecast/restock", payload);
};

const checkAlerts = async (clientId) => {
  const lowStock = await Product.find({ clientId, stock: { $lte: "$lowStockThreshold" } }).lean();
  const payload = {
    business_id: clientId,
    data: { inventory: lowStock.map((p) => ({ product: p.name, stock: p.stock, reorder_level: p.lowStockThreshold })), unusual_transactions: [] },
  };
  return callAI("/smartpos/alerts/check", payload);
};

const detectAnomalies = async (clientId) => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const sales = await Sale.find({ clientId, status: "completed", createdAt: { $gte: sevenDaysAgo } }).lean();
  const dailyData = {};
  sales.forEach((s) => {
    const date = new Date(s.createdAt).toISOString().split("T")[0];
    dailyData[date] = (dailyData[date] || 0) + s.total;
  });
  const data = Object.entries(dailyData).map(([date, total]) => ({ date, sales: total, transactions: 0 }));
  return callAI("/smartpos/anomaly/detect", { business_id: clientId, data });
};

const generateReport = async (clientId, reportType, period) => {
  return callAI("/smartpos/report/generate", { business_id: clientId, report_type: reportType, period });
};

const semanticSearch = async (clientId, query, limit = 10) => {
  return callAI("/smartpos/search/semantic", { business_id: clientId, query, limit });
};

module.exports = { chat, executeCommand, getSalesAnalytics, getRestockForecast, checkAlerts, detectAnomalies, generateReport, semanticSearch };