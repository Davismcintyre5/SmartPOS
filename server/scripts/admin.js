require("../dnsSet");

const mongoose = require("mongoose");
const readline = require("readline");
const env = require("../config/env");
const Admin = require("../models/admin/Admin");
const Client = require("../models/admin/Client");
const Payment = require("../models/admin/Payment");
const Subscription = require("../models/admin/Subscription");
const System = require("../models/admin/System");
const AIConfig = require("../models/admin/AIConfig");
const SystemBackup = require("../models/admin/SystemBackup");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const printDivider = () => console.log("\n" + "=".repeat(50));
const printTitle = (title) => {
  printDivider();
  console.log(`  ${title}`);
  printDivider();
};

const listAdmins = async () => {
  try {
    const admins = await Admin.find().select("-password");
    if (admins.length === 0) return console.log("No admins found.");
    console.table(admins.map((a) => ({ id: a._id.toString(), name: a.name, email: a.email, role: a.role })));
  } catch (error) {
    console.error("Failed to list admins:", error.message);
  }
};

const createAdmin = async () => {
  printTitle("Create New Admin");
  const name = await question("Name: ");
  const email = await question("Email: ");
  const password = await question("Password: ");
  const role = await question("Role (admin/superadmin) [superadmin]: ");

  try {
    const admin = await Admin.create({ name, email, password, role: role || "superadmin" });
    console.log(`Admin created: ${admin.email} (${admin.role})`);
  } catch (error) {
    console.error("Failed to create admin:", error.message);
  }
};

const updateAdmin = async () => {
  printTitle("Update Admin");
  await listAdmins();
  const id = await question("Admin ID to update: ");
  const admin = await Admin.findById(id);
  if (!admin) return console.log("Admin not found.");

  const name = await question(`Name [${admin.name}]: `);
  const email = await question(`Email [${admin.email}]: `);
  const password = await question("New password (leave blank to keep): ");
  const role = await question(`Role (admin/s.admin) [${admin.role}]: `);

  const updates = {};
  if (name) updates.name = name;
  if (email) updates.email = email;
  if (password) updates.password = password;
  if (role) updates.role = role;

  try {
    const updated = await Admin.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).select("-password");
    console.log("Admin updated:", updated);
  } catch (error) {
    console.error("Failed to update admin:", error.message);
  }
};

const deleteAdmin = async () => {
  printTitle("Delete Admin");
  await listAdmins();
  const id = await question("Admin ID to delete: ");
  const confirm = await question("Are you sure? (yes/no): ");
  if (confirm.toLowerCase() !== "yes") return console.log("Cancelled.");

  try {
    await Admin.findByIdAndDelete(id);
    console.log("Admin deleted.");
  } catch (error) {
    console.error("Failed to delete admin:", error.message);
  }
};

const listCollections = async () => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    if (collections.length === 0) return console.log("No collections found.");
    console.table(collections.map((c) => ({ name: c.name })));
  } catch (error) {
    console.error("Failed to list collections:", error.message);
  }
};

const dropCollection = async () => {
  printTitle("Drop Collection");
  await listCollections();
  const name = await question("Collection name to drop: ");
  const confirm = await question(`DROP "${name}"? This is irreversible. (yes/no): `);
  if (confirm.toLowerCase() !== "yes") return console.log("Cancelled.");

  try {
    await mongoose.connection.db.dropCollection(name);
    console.log(`Collection "${name}" dropped.`);
  } catch (error) {
    console.error("Failed to drop collection:", error.message);
  }
};

const dropEntireDatabase = async () => {
  printTitle("DROP ENTIRE DATABASE");
  const dbName = mongoose.connection.db.databaseName;
  console.log(`Database name: ${dbName}`);
  console.log("");
  const confirm = await question(`Type "${dbName}" to confirm DROP: `);
  if (confirm !== dbName) return console.log("Database name mismatch. Cancelled.");

  try {
    await mongoose.connection.db.dropDatabase();
    console.log(`Database "${dbName}" dropped completely.`);
  } catch (error) {
    console.error("Failed to drop database:", error.message);
  }
};

const listClients = async () => {
  try {
    const clients = await Client.find().select("businessName email status subscription.plan");
    if (clients.length === 0) return console.log("No clients found.");
    console.table(clients.map((c) => ({
      id: c._id.toString(),
      business: c.businessName,
      email: c.email,
      status: c.status,
      plan: c.subscription?.plan || "N/A",
    })));
  } catch (error) {
    console.error("Failed to list clients:", error.message);
  }
};

const manageClient = async () => {
  printTitle("Manage Client");
  await listClients();
  const id = await question("Client ID to manage: ");
  const client = await Client.findById(id);
  if (!client) return console.log("Client not found.");

  console.log(`\nClient: ${client.businessName} (${client.email})`);
  console.log(`Status: ${client.status} | Plan: ${client.subscription?.plan} | License: ${client.licenseValid ? "Valid" : "Invalid"}`);

  printDivider();
  console.log("1. Toggle Status (active/suspended)");
  console.log("2. Invalidate License");
  console.log("3. Validate License");
  console.log("4. Delete Client");
  console.log("0. Back");
  const choice = await question("Choice: ");

  if (choice === "1") {
    client.status = client.status === "active" ? "suspended" : "active";
    await client.save();
    console.log(`Status set to: ${client.status}`);
  } else if (choice === "2") {
    client.licenseValid = false;
    await client.save();
    console.log("License invalidated.");
  } else if (choice === "3") {
    client.licenseValid = true;
    await client.save();
    console.log("License validated.");
  } else if (choice === "4") {
    const confirm = await question("DELETE this client and all their data? (yes/no): ");
    if (confirm.toLowerCase() === "yes") {
      await Client.findByIdAndDelete(id);
      console.log("Client deleted.");
    }
  }
};

const showMenu = async () => {
  while (true) {
    printTitle("SmartPOS Admin CLI");
    console.log("1.  List Admins");
    console.log("2.  Create Admin");
    console.log("3.  Update Admin");
    console.log("4.  Delete Admin");
    console.log("5.  List Clients");
    console.log("6.  Manage Client");
    console.log("7.  List Collections");
    console.log("8.  Drop Collection");
    console.log("9.  Drop Entire Database");
    console.log("0.  Exit");

    const choice = await question("\nChoice: ");

    switch (choice) {
      case "1": await listAdmins(); break;
      case "2": await createAdmin(); break;
      case "3": await updateAdmin(); break;
      case "4": await deleteAdmin(); break;
      case "5": await listClients(); break;
      case "6": await manageClient(); break;
      case "7": await listCollections(); break;
      case "8": await dropCollection(); break;
      case "9": await dropEntireDatabase(); break;
      case "0":
        console.log("Goodbye.");
        await mongoose.disconnect();
        rl.close();
        process.exit(0);
      default:
        console.log("Invalid choice.");
    }
  }
};

mongoose.connect(env.MONGO_URI).then(() => {
  console.log("Database connected. Starting admin CLI...\n");
  showMenu();
}).catch((error) => {
  console.error("Database connection failed:", error.message);
  process.exit(1);
});