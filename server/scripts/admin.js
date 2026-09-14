require('./dnsSet');

const readline = require('readline');
const mongoose = require('mongoose');

const { connectDB } = require('../config/db');
const { hashPassword } = require('../utils/password');
const AdminUser = require('../models/admin/AdminUser');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const listAdmins = async () => {
  console.log('\n=== LIST ADMINS ===\n');

  const admins = await AdminUser.find({}).select('name email role active lastLoginAt createdAt').lean();

  if (!admins.length) {
    console.log('No admins found.');
    return;
  }

  admins.forEach((admin, index) => {
    console.log(`[${index + 1}]`);
    console.log(`  ID: ${admin._id}`);
    console.log(`  Name: ${admin.name}`);
    console.log(`  Email: ${admin.email}`);
    console.log(`  Role: ${admin.role}`);
    console.log(`  Active: ${admin.active}`);
    console.log(`  Last login: ${admin.lastLoginAt ? admin.lastLoginAt.toISOString() : 'never'}`);
    console.log(`  Created: ${admin.createdAt.toISOString()}`);
    console.log('');
  });
};

const createAdmin = async () => {
  console.log('\n=== CREATE ADMIN ===\n');

  const name = await question('Full Name: ');
  const email = await question('Email: ');
  const password = await question('Password: ');
  const roleInput = await question('Role (super_admin/admin/support/read_only) [admin]: ');

  if (!name || !email || !password) {
    console.log('Name, email and password are required.');
    return;
  }

  const allowedRoles = ['super_admin', 'admin', 'support', 'read_only'];
  const role = allowedRoles.includes(roleInput) ? roleInput : 'admin';

  const existing = await AdminUser.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.log('Email already exists.');
    return;
  }

  const passwordHash = await hashPassword(password);

  const admin = await AdminUser.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role,
    active: true
  });

  console.log('\nAdmin created successfully!');
  console.log(`  ID: ${admin._id}`);
  console.log(`  Name: ${admin.name}`);
  console.log(`  Email: ${admin.email}`);
  console.log(`  Role: ${admin.role}`);
};

const manageAdmins = async () => {
  console.log('\n=== MANAGE ADMINS ===\n');

  const admins = await AdminUser.find({}).select('name email role active').lean();

  if (!admins.length) {
    console.log('No admins found.');
    return;
  }

  admins.forEach((admin, index) => {
    console.log(`[${index + 1}] ${admin.name} (${admin.email}) - ${admin.role} - ${admin.active ? 'active' : 'inactive'}`);
  });

  const choice = await question('\nSelect admin number: ');
  const admin = admins[parseInt(choice, 10) - 1];

  if (!admin) {
    console.log('Invalid selection.');
    return;
  }

  console.log('\n1. Deactivate');
  console.log('2. Activate');
  console.log('3. Delete');
  console.log('4. Change Role');
  console.log('5. Reset Password');
  console.log('6. Back');

  const action = await question('Select action: ');

  switch (action) {
    case '1':
      await AdminUser.updateOne({ _id: admin._id }, { active: false });
      console.log('Admin deactivated.');
      break;

    case '2':
      await AdminUser.updateOne({ _id: admin._id }, { active: true });
      console.log('Admin activated.');
      break;

    case '3': {
      const confirm = await question(`Delete ${admin.email}? (yes/no): `);
      if (confirm.toLowerCase() === 'yes') {
        await AdminUser.deleteOne({ _id: admin._id });
        console.log('Admin deleted.');
      } else {
        console.log('Cancelled.');
      }
      break;
    }

    case '4': {
      const newRole = await question('New Role (super_admin/admin/support/read_only): ');
      const roles = ['super_admin', 'admin', 'support', 'read_only'];
      if (!roles.includes(newRole)) {
        console.log('Invalid role.');
        break;
      }
      await AdminUser.updateOne({ _id: admin._id }, { role: newRole });
      console.log('Role updated.');
      break;
    }

    case '5': {
      const newPassword = await question('New Password: ');
      if (!newPassword || newPassword.length < 8) {
        console.log('Password must be at least 8 characters.');
        break;
      }
      const passwordHash = await hashPassword(newPassword);
      await AdminUser.updateOne({ _id: admin._id }, { passwordHash });
      console.log('Password reset.');
      break;
    }

    default:
      console.log('Back to main menu.');
  }
};

const listCollections = async () => {
  console.log('\n=== DATABASE COLLECTIONS ===\n');

  const collections = await mongoose.connection.db.listCollections().toArray();

  if (!collections.length) {
    console.log('No collections found.');
    return;
  }

  for (let i = 0; i < collections.length; i++) {
    const name = collections[i].name;
    const count = await mongoose.connection.db.collection(name).countDocuments();
    console.log(`[${i + 1}] ${name} — ${count} docs`);
  }

  console.log(`\nTotal: ${collections.length} collections`);
};

const dropCollection = async () => {
  console.log('\n=== DROP COLLECTION ===\n');

  const collections = await mongoose.connection.db.listCollections().toArray();

  collections.forEach((c, index) => {
    console.log(`[${index + 1}] ${c.name}`);
  });

  const choice = await question('\nSelect collection number to drop: ');
  const target = collections[parseInt(choice, 10) - 1];

  if (!target) {
    console.log('Invalid selection.');
    return;
  }

  const confirm = await question(`Are you sure you want to drop "${target.name}"? (yes/no): `);

  if (confirm.toLowerCase() === 'yes') {
    await mongoose.connection.db.dropCollection(target.name);
    console.log(`Dropped: ${target.name}`);
  } else {
    console.log('Cancelled.');
  }
};

const dropEntireDatabase = async () => {
  console.log('\n=== DROP ENTIRE DATABASE ===\n');

  const confirm = await question('WARNING: This will delete ALL data. Type "DELETE" to confirm: ');

  if (confirm !== 'DELETE') {
    console.log('Cancelled.');
    return;
  }

  await mongoose.connection.db.dropDatabase();
  console.log('\nEntire database dropped successfully.');
};

const showMenu = () => {
  console.log('\n=== SmartPOS ADMIN CLI ===\n');
  console.log('1. List Admins');
  console.log('2. Create Admin');
  console.log('3. Manage Admins');
  console.log('4. Database');
  console.log('0. Exit');
};

const databaseMenu = async () => {
  console.log('\n=== DATABASE ===\n');
  console.log('1. List Collections');
  console.log('2. Drop Collection');
  console.log('3. Drop Entire Database');
  console.log('0. Back');

  const choice = await question('\nSelect option: ');

  switch (choice) {
    case '1': await listCollections(); break;
    case '2': await dropCollection(); break;
    case '3': await dropEntireDatabase(); break;
    case '0': return;
    default: console.log('Invalid option.');
  }
};

const main = async () => {
  await connectDB();

  while (true) {
    showMenu();
    const choice = await question('\nSelect option: ');

    try {
      switch (choice) {
        case '1': await listAdmins(); break;
        case '2': await createAdmin(); break;
        case '3': await manageAdmins(); break;
        case '4': await databaseMenu(); break;
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