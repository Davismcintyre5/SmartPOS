require("../dnsSet");

const mongoose = require("mongoose");
const readline = require("readline");
const env = require("../config/env");
const Subscription = require("../models/admin/Subscription");
const System = require("../models/admin/System");
const PaymentMethod = require("../models/admin/PaymentMethod");
const AdminCurrency = require("../models/admin/Currency");
const AIConfig = require("../models/admin/AIConfig");
const Communication = require("../models/admin/Communication");
const Content = require("../models/public/Content");
const Admin = require("../models/admin/Admin");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const printDivider = () => console.log("\n" + "=".repeat(50));
const printTitle = (title) => { printDivider(); console.log(`  ${title}`); printDivider(); };

const upsertContent = async (section, title, body) => {
  const existing = await Content.findOne({ section });
  if (existing) {
    const overwrite = await question(`${title} already exists. Overwrite? (yes/no): `);
    if (overwrite.toLowerCase() !== "yes") return console.log(`Skipped ${title}.`);
  }
  await Content.findOneAndUpdate({ section }, { section, title, body, active: true }, { upsert: true });
  console.log(`${title} seeded.`);
};

// Subscription Plan
const seedGeneralSettings = async () => {
  const existing = await Subscription.findOne();
  if (existing) {
    const overwrite = await question("Subscription plan already exists. Overwrite? (yes/no): ");
    if (overwrite.toLowerCase() !== "yes") return console.log("Skipped.");
  }
  await Subscription.findOneAndUpdate({}, {
    priceMonthly: 500,
    priceYearly: 5000,
    pricePermanent: 12000,
    currency: "KES",
    freeTrialDays: 14,
  }, { upsert: true });
  console.log("Subscription plan seeded (KES 500/5,000/12,000).");
};

// System Settings
const seedSystem = async () => {
  const existing = await System.findOne();
  if (existing) {
    const overwrite = await question("System settings already exist. Overwrite? (yes/no): ");
    if (overwrite.toLowerCase() !== "yes") return console.log("Skipped.");
  }
  await System.findOneAndUpdate({}, {
    appName: "SmartPOS",
    primaryColor: "#2563eb",
    logoUrl: "",
    maintenanceMode: false,
    mobileAppEnabled: false,
    mobileAppUrl: "",
    desktopAppEnabled: false,
    desktopAppUrl: "",
  }, { upsert: true });
  console.log("System settings seeded.");
};

// Payment Methods & Currency
const seedPaymentAndCurrency = async () => {
  const existing = await PaymentMethod.findOne();
  if (existing) {
    const overwrite = await question("Payment methods already exist. Overwrite? (yes/no): ");
    if (overwrite.toLowerCase() !== "yes") {
      console.log("Skipped payment methods.");
    } else {
      await PaymentMethod.findOneAndUpdate({}, {
        stripeEnabled: false, stripePublishableKey: "", stripeSecretKey: "",
        mpesaEnabled: true, mpesaShortCode: "",
        mpesaMethods: { stkPush: false, sendMoney: true, sendMoneyPhoneNumber: "0768784909", till: true, tillNumber: "222123", tillBusinessName: "SmartPOS", paybill: false, paybillBusinessNumber: "", paybillAccountName: "" },
        paypalEnabled: false, paypalClientId: "", paypalSecretKey: "",
      }, { upsert: true });
      console.log("Payment methods seeded.");
    }
  } else {
    await PaymentMethod.create({
      stripeEnabled: false, stripePublishableKey: "", stripeSecretKey: "",
      mpesaEnabled: true, mpesaShortCode: "",
      mpesaMethods: { stkPush: false, sendMoney: true, sendMoneyPhoneNumber: "0768784909", till: true, tillNumber: "222123", tillBusinessName: "SmartPOS", paybill: false, paybillBusinessNumber: "", paybillAccountName: "" },
      paypalEnabled: false, paypalClientId: "", paypalSecretKey: "",
    });
    console.log("Payment methods seeded.");
  }

  const currencyExists = await AdminCurrency.findOne();
  if (currencyExists) {
    const overwrite = await question("Admin currency already exists. Overwrite? (yes/no): ");
    if (overwrite.toLowerCase() !== "yes") return console.log("Skipped currency.");
  }
  await AdminCurrency.findOneAndUpdate({}, { baseCurrency: "KES" }, { upsert: true });
  console.log("Admin currency seeded (KES).");
};

// AI Configuration
const seedAI = async () => {
  const existing = await AIConfig.findOne();
  if (existing) {
    const overwrite = await question("AI config already exists. Overwrite? (yes/no): ");
    if (overwrite.toLowerCase() !== "yes") return console.log("Skipped.");
  }
  await AIConfig.findOneAndUpdate({}, {
    providers: [
      { name: "hdm", enabled: true, apiKey: "hdm_sma_fac92bbe8a6ba702baf750eceec2e1e60db7a701c044cc43", baseUrl: "" },
      { name: "deepseek", enabled: false, apiKey: "", baseUrl: "" },
      { name: "chatgpt", enabled: false, apiKey: "", baseUrl: "" },
      { name: "claude", enabled: false, apiKey: "", baseUrl: "" },
      { name: "gemini", enabled: false, apiKey: "", baseUrl: "" },
    ],
    globalDefault: "hdm",
    landingEnabled: true,
    clientEnabled: true,
    fileUploadEnabled: true,
    outwardKeyEnabled: true,
  }, { upsert: true });
  console.log("AI configuration seeded.");
};

// Communication Templates
const seedCommunication = async () => {
  const existing = await Communication.findOne();
  if (existing) {
    const overwrite = await question("Communication templates already exist. Overwrite? (yes/no): ");
    if (overwrite.toLowerCase() !== "yes") return console.log("Skipped.");
  }
  await Communication.findOneAndUpdate({}, {
    emailTemplates: {
      trialLicense: "Welcome to SmartPOS!\n\nYour free trial license key is: {{licenseKey}}\n\nStart using SmartPOS immediately. No setup fees.\n\nNeed help? Contact support@smartpos.com or call +254768784909.",
      paymentApproved: "Payment Approved\n\nYour payment has been approved. Your license is now active.\n\nThank you for choosing SmartPOS.",
      paymentRejected: "Payment Rejected\n\nYour payment was rejected. Reason: {{reason}}\n\nPlease contact support@smartpos.com or try again.",
    },
    smsTemplates: {
      trialLicense: "SmartPOS trial license: {{licenseKey}}. Support: +254768784909",
    },
  }, { upsert: true });
  console.log("Communication templates seeded.");
};

// Content Sections
const seedContact = () => upsertContent("contact", "Contact Us", "Email: support@smartpos.com\nPhone: +254768784909\nAddress: Nairobi, Kenya\nHours: Monday - Friday, 8:00 AM - 6:00 PM EAT");
const seedAbout = () => upsertContent("about", "About SmartPOS", "SmartPOS is a fast, reliable point of sale system built for supermarkets, wholesale, and retail shops.\n\nDesigned in Kenya for African businesses, SmartPOS supports multiple currencies including KES, USD, UGX, TZS, and more.\n\nOur mission is to make checkout lightning-fast with barcode scanning, offline-first reliability, and seamless M-Pesa integration.");
const seedFeatures = () => upsertContent("features", "Features", "1. Fast Barcode Scanning - Camera and external scanner support for instant product detection.\n2. Multi-Currency Support - KES, USD, UGX, TZS, RWF, BIF, ZAR, NGN, GHS, and more.\n3. M-Pesa Integration - STK Push, Send Money, Till Number, and Paybill.\n4. Offline-First Mode - Continue selling even when the internet is down. Syncs automatically when back online.\n5. AI-Powered Insights - Sales analytics, inventory forecasting, and anomaly detection.\n6. Multi-User Staff Management - Cashier, manager, and admin roles with permissions.\n7. Customer Management - Track customer purchases, loyalty points, and history.\n8. Tax Compliance - Built-in TIMS/eTIMS support for Kenya.\n9. Cloud Backups - Automatic and manual backups to keep your data safe.\n10. 24/7 Support - Email and phone support whenever you need help.");
const seedFacts = () => upsertContent("facts", "Why Choose SmartPOS", "1. Process a sale in under 3 seconds with instant barcode detection.\n2. Works offline — no internet? No problem. Syncs when you're back online.\n3. Trusted by businesses across Kenya, Uganda, Tanzania, and beyond.\n4. Supports 10+ currencies with automatic conversion.\n5. M-Pesa payments reconcile automatically — no manual verification.\n6. AI detects unusual transactions and low stock before they become problems.\n7. Your data is completely isolated — no other business can see your information.\n8. Free 14-day trial with full access to all features.\n9. Permanent license option available — pay once, use forever.\n10. Built by a team that understands African retail challenges.");
const seedFAQs = () => upsertContent("faqs", "Frequently Asked Questions", "1. How does the free trial work?\nYou get 14 days of full access to SmartPOS with no credit card required. Your license key is issued instantly upon registration.\n\n2. Can I switch plans later?\nYes, you can upgrade from trial to monthly, yearly, or permanent at any time from your account settings.\n\n3. What payment methods do you accept?\nWe accept M-Pesa (STK Push, Send Money, Till Number, Paybill), Stripe (cards), and PayPal.\n\n4. Does SmartPOS work offline?\nYes. SmartPOS is offline-first. If your internet goes down, you can continue selling. All data syncs automatically when the connection is restored.\n\n5. How many users can I add?\nYou can add unlimited staff users with different roles: cashier, manager, and admin.\n\n6. Is my data safe?\nAbsolutely. Each business has its own isolated database. No one else can access your data. We also provide automatic and manual backup options.\n\n7. What currencies do you support?\nKES, USD, EUR, GBP, UGX, TZS, RWF, BIF, ZAR, NGN, GHS. You can switch your business currency anytime and all prices convert automatically.\n\n8. How do I contact support?\nEmail support@smartpos.com or call +254768784909. We are available Monday to Friday, 8 AM - 6 PM EAT.\n\n9. Can I use my own AI provider?\nYes. You can use our default HDM AI or bring your own API key for DeepSeek, ChatGPT, Claude, or Gemini.\n\n10. Is there a permanent license?\nYes. Pay once (KES 12,000) and use SmartPOS forever with no recurring fees.");
const seedHelp = () => upsertContent("help", "Help Center", "Getting Started\n1. Register your business at the signup page.\n2. Check your email for your free trial license key.\n3. Log in to the client panel and set up your products.\n4. Configure your currency and payment methods.\n5. Start selling.\n\nBarcode Setup\n- External scanner: Plug in via USB. It works instantly — just scan.\n- Camera scanner: Enable in Settings. Use your device camera to scan barcodes.\n\nPayments\n- M-Pesa: Ensure your phone number or till/paybill details are set in the admin panel.\n- Cash: Select cash at checkout. The system tracks your cash drawer.\n\nBackups\n- Client backup: Go to Settings > Backups and create a manual backup anytime.\n- System backup: Admins can back up the entire system from the admin panel.\n\nSupport\nEmail: support@smartpos.com\nPhone: +254768784909\nHours: Monday - Friday, 8:00 AM - 6:00 PM EAT");
const seedPricing = () => upsertContent("pricing", "Pricing Plans", "Free Trial - KES 0 - 14 days full access. No credit card required.\n\nMonthly - KES 500/month - Full access, all features, priority support.\n\nYearly - KES 5,000/year - Save 17% compared to monthly. Full access, all features, priority support.\n\nPermanent - KES 12,000 one-time - Pay once, use forever. Full access, all features, lifetime updates.");
const seedHero = () => upsertContent("hero", "The Smartest POS for African Retail", "Lightning-fast checkout, barcode scanning, M-Pesa integration, and multi-currency support. Built for supermarkets, wholesale, and retail shops.");

// Legal Pages
const seedLegalTerms = () => upsertContent("terms", "Terms and Conditions", "1. Acceptance of Terms\nBy accessing and using SmartPOS, you agree to be bound by these Terms and Conditions. If you do not agree, do not use our services.\n\n2. Subscription and Payments\nSmartPOS offers monthly (KES 500), yearly (KES 5,000), and permanent (KES 12,000) subscriptions. All payments are processed securely via M-Pesa, Stripe, or PayPal. Prices may change with notice.\n\n3. Free Trial\nThe free trial lasts 14 days with full access. No credit card is required. At the end of the trial, you must subscribe to continue using SmartPOS.\n\n4. License Keys\nLicense keys are issued upon registration for free trials or upon admin approval for paid plans. Sharing license keys is prohibited.\n\n5. Data Privacy\nYour business data is isolated and never shared with other clients. See our Privacy Policy for details.\n\n6. Acceptable Use\nYou agree not to use SmartPOS for illegal activities, fraud, or any purpose that violates Kenyan or international law.\n\n7. Service Availability\nWe strive for 99.9% uptime but are not liable for downtime caused by factors beyond our control.\n\n8. Termination\nSmartPOS reserves the right to suspend or terminate accounts that violate these terms. No refunds for terminated accounts.\n\n9. Limitation of Liability\nSmartPOS is provided as-is. We are not liable for any direct or indirect damages arising from use of the software.\n\n10. Changes to Terms\nWe may update these terms at any time. Continued use after changes constitutes acceptance.");
const seedLegalPrivacy = () => upsertContent("privacy", "Privacy Policy", "1. Information We Collect\nWe collect business name, owner name, email address, and phone number during registration. We also collect transaction data necessary for POS operations.\n\n2. How We Use Your Data\nYour data is used solely to provide and improve SmartPOS services. We do not sell, rent, or share your data with third parties.\n\n3. Data Isolation\nEach client's data is stored in an isolated environment. No cross-client data access is possible.\n\n4. Payment Information\nPayment details are processed by third-party gateways (M-Pesa, Stripe, PayPal). We do not store credit card numbers or M-Pesa PINs on our servers.\n\n5. Data Retention\nYour data is retained as long as your account is active. Upon account deletion, all data is permanently removed within 30 days.\n\n6. Security\nWe use industry-standard encryption for data in transit and at rest. Regular backups ensure data integrity.\n\n7. Cookies\nWe use essential cookies for authentication and session management. See our Cookies Policy for details.\n\n8. Third-Party Services\nSmartPOS integrates with AI providers (HDM AI, DeepSeek, ChatGPT, Claude, Gemini). Data sent to these services is governed by their respective privacy policies.\n\n9. Your Rights\nYou have the right to access, correct, or delete your data at any time. Contact support@smartpos.com for data requests.\n\n10. Contact\nFor privacy concerns, contact us at support@smartpos.com or call +254768784909.");
const seedLegalCookies = () => upsertContent("cookies", "Cookies Policy", "1. What Are Cookies\nCookies are small text files stored on your device when you visit our website or use our application.\n\n2. How We Use Cookies\nWe use essential cookies for authentication, session management, and security. These cookies are required for SmartPOS to function.\n\n3. Analytics Cookies\nWe may use analytics cookies to understand how our service is used and to improve performance.\n\n4. Third-Party Cookies\nPayment gateways (M-Pesa, Stripe, PayPal) may set their own cookies during checkout. These are governed by their respective policies.\n\n5. AI Provider Cookies\nAI services (HDM AI, DeepSeek, ChatGPT, Claude, Gemini) may use cookies when processing requests through their APIs.\n\n6. Managing Cookies\nYou can disable cookies in your browser settings. However, this may affect SmartPOS functionality.\n\n7. Cookie Duration\nSession cookies expire when you close your browser. Persistent cookies may remain for up to 30 days.\n\n8. Consent\nBy using SmartPOS, you consent to our use of cookies as described in this policy.\n\n9. Changes to This Policy\nWe may update this policy at any time. Changes will be posted on our website.\n\n10. Contact\nFor questions about cookies, contact support@smartpos.com.");
const seedLegalRefund = () => upsertContent("refund", "Refund Policy", "1. Free Trial\nNo charges during the free trial. No refund applicable.\n\n2. Monthly Subscriptions\nRefunds are available within 7 days of payment if the service has not been used extensively.\n\n3. Yearly Subscriptions\nRefunds are available within 14 days of payment. A prorated amount may apply if the service has been used.\n\n4. Permanent License\nPermanent licenses are non-refundable after 30 days. Within 30 days, a full refund is available if unsatisfied.\n\n5. How to Request a Refund\nEmail support@smartpos.com with your license key and reason for refund. We process requests within 5 business days.\n\n6. Refund Method\nRefunds are processed via the original payment method.\n\n7. Disputes\nIf you dispute a charge through your bank or payment provider, your account may be suspended pending resolution.\n\n8. Duplicate Payments\nDuplicate payments are refunded in full upon verification.\n\n9. Downgrades\nDowngrading from yearly to monthly does not trigger a refund for the remaining period.\n\n10. Contact\nFor refund inquiries, contact support@smartpos.com or call +254768784909.");
const seedLegalDisclaimer = () => upsertContent("disclaimer", "Disclaimer", "1. Software As-Is\nSmartPOS is provided as-is without warranties of any kind, express or implied.\n\n2. Financial Accuracy\nWhile we strive for accuracy, SmartPOS is not responsible for financial losses due to software errors, miscalculations, or system downtime.\n\n3. Tax Compliance\nSmartPOS provides tools for tax compliance but does not guarantee compliance with local tax laws. Consult a tax professional.\n\n4. AI-Generated Insights\nAI features provide suggestions based on your data. These are advisory only and should not replace professional judgment.\n\n5. Third-Party Services\nWe are not responsible for the availability or accuracy of third-party services including payment gateways and AI providers.\n\n6. Data Loss\nWe recommend regular backups. SmartPOS is not liable for data loss due to hardware failure, software bugs, or user error.\n\n7. Security\nWe implement security measures but cannot guarantee complete protection against cyber threats.\n\n8. Force Majeure\nWe are not liable for service interruptions caused by events beyond our control including natural disasters, war, or internet outages.\n\n9. Updates\nWe may update SmartPOS at any time. Updates may add, modify, or remove features.\n\n10. Contact\nFor questions about this disclaimer, contact support@smartpos.com.");
const seedLegalAcceptableUse = () => upsertContent("acceptable-use", "Acceptable Use Policy", "1. Lawful Use\nSmartPOS must be used only for lawful business purposes in compliance with all applicable laws.\n\n2. Prohibited Activities\nYou may not use SmartPOS for fraud, money laundering, selling illegal goods, or any criminal activity.\n\n3. Account Security\nYou are responsible for maintaining the confidentiality of your login credentials and license key.\n\n4. No Sharing\nLicense keys are for a single business only. Sharing keys across multiple businesses is prohibited.\n\n5. Data Integrity\nYou agree not to upload malicious code, viruses, or corrupted data that could harm the system.\n\n6. Fair Usage\nExcessive API calls or attempts to disrupt service for other users may result in account suspension.\n\n7. Intellectual Property\nSmartPOS code, design, and branding are our intellectual property. Reverse engineering is prohibited.\n\n8. Reporting Violations\nReport violations to support@smartpos.com.\n\n9. Penalties\nViolations may result in immediate account suspension or termination without refund.\n\n10. Changes\nWe may update this policy at any time. Continued use constitutes acceptance.");
const seedLegalDataProcessing = () => upsertContent("data-processing", "Data Processing Agreement", "1. Data Controller and Processor\nYou are the data controller for your business data. SmartPOS is the data processor.\n\n2. Purpose of Processing\nData is processed solely to provide POS services including sales tracking, inventory management, and reporting.\n\n3. Data Types Processed\nBusiness information, product data, sales transactions, customer information, and staff user data.\n\n4. Processing Duration\nData is processed for the duration of your subscription plus 30 days after termination.\n\n5. Sub-Processors\nWe use sub-processors for payment processing (M-Pesa, Stripe, PayPal), AI services, email/SMS (Brevo), and cloud storage (Cloudinary).\n\n6. Security Measures\nWe implement encryption, access controls, and regular security audits to protect your data.\n\n7. Data Breach Notification\nIn the event of a data breach, we will notify you within 72 hours.\n\n8. Data Deletion\nUpon request, your data will be deleted within 30 days of account termination.\n\n9. Cross-Border Transfers\nData may be processed in Kenya or other regions where our servers are located.\n\n10. Contact\nFor DPA inquiries, contact support@smartpos.com.");
const seedLegalSLA = () => upsertContent("sla", "Service Level Agreement", "1. Uptime Commitment\nWe commit to 99.9% uptime for paid subscribers.\n\n2. Support Response Times\nEmail support: within 4 hours during business hours. Phone support: immediate during business hours.\n\n3. Business Hours\nMonday to Friday, 8:00 AM to 6:00 PM East Africa Time (EAT).\n\n4. Critical Issues\nCritical system issues are addressed within 1 hour during business hours.\n\n5. Maintenance Windows\nScheduled maintenance occurs on Sundays between 2:00 AM and 5:00 AM EAT. We provide 48 hours notice.\n\n6. Backup Frequency\nClient data is backed up daily. System backups are performed weekly.\n\n7. Data Recovery\nIn the event of data loss, we will restore from the most recent backup within 24 hours.\n\n8. Compensation\nIf uptime falls below 99.9% in a month, you may request a 10% credit on your next billing cycle.\n\n9. Exclusions\nThis SLA does not cover downtime caused by force majeure events or third-party service failures.\n\n10. Contact\nFor SLA inquiries, contact support@smartpos.com.");
const seedLegalGDPR = () => upsertContent("gdpr", "GDPR Compliance", "1. Scope\nWhile SmartPOS is based in Kenya, we comply with GDPR principles for clients handling EU customer data.\n\n2. Lawful Basis\nWe process data based on contractual necessity and legitimate business interests.\n\n3. Data Subject Rights\nEU data subjects have rights to access, rectify, erase, restrict, and port their data.\n\n4. Consent\nWhere consent is required, we obtain explicit consent before processing personal data.\n\n5. Data Protection Officer\nContact our DPO at support@smartpos.com.\n\n6. Data Minimization\nWe collect only the data necessary to provide our POS services.\n\n7. Retention\nData is retained only as long as necessary for the purposes stated in this policy.\n\n8. International Transfers\nData transfers outside the EU are protected by standard contractual clauses.\n\n9. Complaints\nEU users may lodge complaints with their local data protection authority.\n\n10. Contact\nFor GDPR inquiries, contact support@smartpos.com.");
const seedLegalSecurity = () => upsertContent("security", "Security Policy", "1. Encryption\nAll data in transit is encrypted using TLS 1.3. Data at rest is encrypted using AES-256.\n\n2. Authentication\nWe use JWT-based authentication with 7-day token expiry. Passwords are hashed with bcrypt.\n\n3. Access Control\nRole-based access control ensures users only access what they need. Client data is fully isolated.\n\n4. Monitoring\nWe monitor for unusual activity, failed login attempts, and potential breaches 24/7.\n\n5. Vulnerability Management\nRegular security scans and penetration testing are conducted. Patches are applied within 48 hours.\n\n6. Incident Response\nSecurity incidents are investigated immediately. Affected users are notified within 72 hours.\n\n7. Physical Security\nServers are housed in secure data centers with 24/7 monitoring and biometric access.\n\n8. Employee Access\nEmployee access to client data is logged and audited. Access is revoked upon termination.\n\n9. Compliance\nWe comply with applicable data protection laws and industry best practices.\n\n10. Contact\nReport security concerns to support@smartpos.com.");

// Superadmin
const seedSuperAdmin = async () => {
  const existing = await Admin.findOne({ role: "superadmin" });
  if (existing) { console.log("Superadmin already exists:", existing.email); return; }
  printTitle("Create Superadmin");
  const email = await question("Superadmin email: ");
  const password = await question("Superadmin password: ");
  const name = await question("Superadmin name: ");
  await Admin.create({ name, email, password, role: "superadmin" });
  console.log("Superadmin created.");
};

// Seed All
const seedAll = async () => {
  await seedGeneralSettings();
  await seedSystem();
  await seedPaymentAndCurrency();
  await seedAI();
  await seedCommunication();
  await seedHero();
  await seedContact();
  await seedAbout();
  await seedFeatures();
  await seedFacts();
  await seedFAQs();
  await seedHelp();
  await seedPricing();
  await seedLegalTerms();
  await seedLegalPrivacy();
  await seedLegalCookies();
  await seedLegalRefund();
  await seedLegalDisclaimer();
  await seedLegalAcceptableUse();
  await seedLegalDataProcessing();
  await seedLegalSLA();
  await seedLegalGDPR();
  await seedLegalSecurity();
  await seedSuperAdmin();
  console.log("\nAll settings seeded successfully.");
};

// Menu
const showMenu = async () => {
  while (true) {
    printTitle("SmartPOS Seed Script");
    console.log("1.  Seed All");
    console.log("2.  General Settings (Plan)");
    console.log("3.  System Settings");
    console.log("4.  Payment Methods & Currency");
    console.log("5.  AI Configuration");
    console.log("6.  Communication Templates");
    console.log("7.  Hero Section");
    console.log("8.  Contact Info");
    console.log("9.  About");
    console.log("10. Features");
    console.log("11. Facts");
    console.log("12. FAQs");
    console.log("13. Help");
    console.log("14. Pricing");
    console.log("15. Terms & Conditions");
    console.log("16. Privacy Policy");
    console.log("17. Cookies Policy");
    console.log("18. Refund Policy");
    console.log("19. Disclaimer");
    console.log("20. Acceptable Use");
    console.log("21. Data Processing");
    console.log("22. SLA");
    console.log("23. GDPR");
    console.log("24. Security Policy");
    console.log("25. Superadmin");
    console.log("0.  Exit");

    const choice = await question("\nChoice: ");

    switch (choice) {
      case "1": await seedAll(); break;
      case "2": await seedGeneralSettings(); break;
      case "3": await seedSystem(); break;
      case "4": await seedPaymentAndCurrency(); break;
      case "5": await seedAI(); break;
      case "6": await seedCommunication(); break;
      case "7": await seedHero(); break;
      case "8": await seedContact(); break;
      case "9": await seedAbout(); break;
      case "10": await seedFeatures(); break;
      case "11": await seedFacts(); break;
      case "12": await seedFAQs(); break;
      case "13": await seedHelp(); break;
      case "14": await seedPricing(); break;
      case "15": await seedLegalTerms(); break;
      case "16": await seedLegalPrivacy(); break;
      case "17": await seedLegalCookies(); break;
      case "18": await seedLegalRefund(); break;
      case "19": await seedLegalDisclaimer(); break;
      case "20": await seedLegalAcceptableUse(); break;
      case "21": await seedLegalDataProcessing(); break;
      case "22": await seedLegalSLA(); break;
      case "23": await seedLegalGDPR(); break;
      case "24": await seedLegalSecurity(); break;
      case "25": await seedSuperAdmin(); break;
      case "0":
        console.log("Goodbye.");
        await mongoose.disconnect();
        rl.close();
        process.exit(0);
      default: console.log("Invalid choice.");
    }
  }
};

mongoose.connect(env.MONGO_URI).then(() => {
  console.log("Database connected. Starting seed CLI...\n");
  showMenu();
}).catch((error) => {
  console.error("Database connection failed:", error.message);
  process.exit(1);
});