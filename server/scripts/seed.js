require('./dnsSet');

const readline = require('readline');
const mongoose = require('mongoose');

const { connectDB } = require('../config/db');
const { hashPassword } = require('../utils/password');

const AdminUser = require('../models/admin/AdminUser');
const Client = require('../models/admin/Client');
const Plan = require('../models/admin/Plan');
const PaymentMethod = require('../models/admin/PaymentMethod');
const AdminSettings = require('../models/admin/AdminSettings');
const Legal = require('../models/admin/Legal');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const seedPlans = async () => {
  console.log('\n=== SEED PLANS ===\n');

  const plans = [
    { _id: 'trial', name: 'Free Trial', code: 'trial', description: '14-day free trial', billingType: 'free', cycle: 'none', durationDays: 14, perpetual: false, prices: { KES: 0, USD: 0, EUR: 0, GBP: 0 }, active: true, position: 1 },
    { _id: 'starter', name: 'Starter', code: 'starter', description: 'Starter — monthly', billingType: 'recurring', cycle: 'monthly', durationDays: null, perpetual: false, prices: { KES: 250000, USD: 1900, EUR: 1800, GBP: 1500 }, active: true, position: 2 },
    { _id: 'pro', name: 'Pro', code: 'pro', description: 'Pro — yearly', billingType: 'recurring', cycle: 'yearly', durationDays: null, perpetual: false, prices: { KES: 2500000, USD: 19000, EUR: 18000, GBP: 15000 }, active: true, position: 3 },
    { _id: 'ent', name: 'Enterprise', code: 'ent', description: 'Enterprise — one-time perpetual', billingType: 'one-time', cycle: 'none', durationDays: null, perpetual: true, prices: { KES: 0, USD: 0, EUR: 0, GBP: 0 }, active: true, position: 4 }
  ];

  for (const plan of plans) {
    const result = await Plan.updateOne({ _id: plan._id }, { $setOnInsert: plan }, { upsert: true });
    console.log(result.upsertedCount ? `Created: ${plan.name}` : `Exists: ${plan.name}`);
  }

  console.log('\nPlans seeded.');
};

const seedPaymentMethods = async () => {
  console.log('\n=== SEED PAYMENT METHODS ===\n');

  const methods = [
    { _id: 'stripe', name: 'Stripe', provider: 'stripe', type: 'automatic', enabled: true, status: 'not_configured', supportedCurrencies: ['KES', 'USD', 'EUR', 'GBP'], config: { mode: 'test' }, position: 1 },
    { _id: 'paypal', name: 'PayPal', provider: 'paypal', type: 'automatic', enabled: false, status: 'not_configured', supportedCurrencies: ['USD', 'EUR', 'GBP'], config: { mode: 'sandbox' }, position: 2 },
    { _id: 'mpesa_stk', name: 'M-Pesa STK Push', provider: 'safaricom', type: 'automatic', enabled: false, status: 'not_configured', supportedCurrencies: ['KES'], config: {}, position: 3 },
    { _id: 'mpesa_send', name: 'M-Pesa Send Money', provider: 'safaricom', type: 'manual', enabled: false, status: 'not_configured', supportedCurrencies: ['KES'], config: { receivingPhone: '', receivingName: '' }, position: 4 },
    { _id: 'mpesa_paybill', name: 'M-Pesa Paybill', provider: 'safaricom', type: 'automatic', enabled: false, status: 'not_configured', supportedCurrencies: ['KES'], config: { businessNumber: '', accountPrefix: 'SMART-', mode: 'auto' }, position: 5 },
    { _id: 'mpesa_till', name: 'M-Pesa Till', provider: 'safaricom', type: 'automatic', enabled: false, status: 'not_configured', supportedCurrencies: ['KES'], config: { tillNumber: '', mode: 'auto' }, position: 6 }
  ];

  for (const method of methods) {
    const result = await PaymentMethod.updateOne({ _id: method._id }, { $setOnInsert: method }, { upsert: true });
    console.log(result.upsertedCount ? `Created: ${method.name}` : `Exists: ${method.name}`);
  }

  console.log('\nPayment methods seeded.');
};

const seedAdminSettings = async () => {
  console.log('\n=== SEED ADMIN SETTINGS ===\n');

  const existing = await AdminSettings.findById('global');

  if (existing) {
    console.log('Admin settings already exist.');
    return;
  }

  await AdminSettings.create({
    _id: 'global',
    currencies: { system: ['KES', 'USD', 'EUR', 'GBP'], store: ['KES', 'USD', 'EUR', 'GBP', 'TZS', 'UGX', 'NGN', 'GHS', 'RWF', 'BIF'], defaultSubscription: 'USD', defaultStore: 'KES' },
    tax: { defaultRate: 16, label: 'VAT', inclusive: false },
    branding: { platformName: 'SmartPOS', logoUrl: null, supportEmail: 'support@smartpos.com', supportPhone: '', termsUrl: '', privacyUrl: '' },
    email: { fromName: 'SmartPOS', fromAddress: 'noreply@smartpos.com', replyTo: 'support@smartpos.com', templates: {} },
    sms: { senderId: 'SmartPOS', enabled: true, dailyLimit: 1000, templates: {} },
    backups: { enabled: true, destination: 'cloudinary', retentionDays: 30, schedule: '0 2 * * *', emailOnCompletion: false, emailRecipients: [] },
    featureFlags: { apiAccess: true, loyalty: false, multiLocation: false, maintenanceMode: false },
    security: { accessTokenMinutes: 15, refreshTokenDays: 7, minPasswordLength: 8, require2FAForAdmin: false },
    sync: { intervalSeconds: 30, pullBatchSize: 200, maxOutboxRetries: 10 },
    onboarding: { defaultPlan: 'trial', requireEmailVerification: false, requireAdminApproval: true, trialDays: 14, graceDays: 14 },
    maintenanceMessage: 'SmartPOS is under maintenance. Please try again shortly.'
  });

  console.log('Admin settings created.');
};

const seedLegal = async () => {
  console.log('\n=== SEED LEGAL ===\n');

  const docs = [
    { type: 'terms', version: '1.0', title: 'Terms of Service', content: '# Terms of Service\n\nPlaceholder. Update from admin panel.', contentFormat: 'markdown', locale: 'en', effectiveFrom: new Date(), active: true, requiresAcceptance: true },
    { type: 'privacy', version: '1.0', title: 'Privacy Policy', content: '# Privacy Policy\n\nPlaceholder. Update from admin panel.', contentFormat: 'markdown', locale: 'en', effectiveFrom: new Date(), active: true, requiresAcceptance: true }
  ];

  for (const doc of docs) {
    const existing = await Legal.findOne({ type: doc.type, version: doc.version });
    if (existing) {
      console.log(`Exists: ${doc.type} v${doc.version}`);
      continue;
    }
    await Legal.create(doc);
    console.log(`Created: ${doc.type} v${doc.version}`);
  }

  console.log('\nLegal seeded.');
};

const seedSuperAdmin = async () => {
  console.log('\n=== SEED SUPER ADMIN ===\n');

  const email = 'admin@smartpos.com';
  const existing = await AdminUser.findOne({ email });

  if (existing) {
    console.log(`Super admin exists: ${existing.email}`);
    return;
  }

  const passwordHash = await hashPassword('Admin@123');

  const admin = await AdminUser.create({
    name: 'SmartPOS Super Admin',
    email,
    passwordHash,
    role: 'super_admin',
    active: true
  });

  console.log(`Created super admin: ${admin.email}`);
  console.log('Password: Admin@123');
};

const seedDemoClient = async () => {
  console.log('\n=== SEED DEMO CLIENT ===\n');

  const email = 'demo@smartpos.com';
  const existing = await Client.findOne({ ownerEmail: email });

  if (existing) {
    console.log(`Demo client exists: ${existing.name}`);
    return;
  }

  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setDate(periodEnd.getDate() + 14);

  const client = await Client.create({
    name: 'Demo Store',
    slug: 'demo-store',
    ownerName: 'Demo Owner',
    ownerEmail: email,
    ownerPhone: '+254700000000',
    country: 'Kenya',
    subscriptionCurrency: 'USD',
    storeCurrency: 'KES',
    plan: 'trial',
    status: 'trialing',
    periodStart: now,
    periodEnd,
    autoRenew: false,
    settings: { taxRate: 16, taxLabel: 'VAT', currency: 'KES', timezone: 'Africa/Nairobi' }
  });

  console.log(`Created demo client: ${client.name} (${client._id})`);
};

const seedAll = async () => {
  await seedPlans();
  await seedPaymentMethods();
  await seedAdminSettings();
  await seedLegal();
  await seedSuperAdmin();
  await seedDemoClient();
};

const showMenu = () => {
  console.log('\n=== SmartPOS SEED CLI ===\n');
  console.log('1. Seed All');
  console.log('2. Seed Settings (Plans, Methods, Settings, Legal)');
  console.log('3. Seed Super Admin');
  console.log('4. Seed Demo Client');
  console.log('0. Exit');
};

const main = async () => {
  await connectDB();

  while (true) {
    showMenu();
    const choice = await question('\nSelect option: ');

    try {
      switch (choice) {
        case '1': await seedAll(); break;
        case '2':
          await seedPlans();
          await seedPaymentMethods();
          await seedAdminSettings();
          await seedLegal();
          break;
        case '3': await seedSuperAdmin(); break;
        case '4': await seedDemoClient(); break;
        case '0':
          console.log('Exiting...');
          await mongoose.disconnect();
          rl.close();
          return;
        default:
          console.log('Invalid option.');
      }
    } catch (err) {
      console.error('Error:', err.message);
    }
  }
};

main().catch(async (error) => {
  console.error('Error:', error.message);
  await mongoose.disconnect();
  rl.close();
});