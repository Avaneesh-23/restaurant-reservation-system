require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Table = require('../models/Table');

const tables = [
  { tableNumber: 1, capacity: 2 },
  { tableNumber: 2, capacity: 2 },
  { tableNumber: 3, capacity: 4 },
  { tableNumber: 4, capacity: 4 },
  { tableNumber: 5, capacity: 6 },
  { tableNumber: 6, capacity: 6 },
  { tableNumber: 7, capacity: 8 },
];

const seed = async (shouldExit = true) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected for seeding');

    await Table.deleteMany({});
    await Table.insertMany(tables);
    console.log(`Seeded ${tables.length} tables`);

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@restaurant.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({
        name: 'Restaurant Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
      });
      console.log(`Admin created: ${adminEmail} / ${adminPassword}`);
    } else {
      admin.role = 'admin';
      admin.password = adminPassword;
      await admin.save();
      console.log(`Admin updated: ${adminEmail} / ${adminPassword}`);
    }

    console.log('Seeding complete');
    if (shouldExit) process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    if (shouldExit) process.exit(1);
    throw error;
  }
};

// Run seed if called directly
if (require.main === module) {
  seed();
}

module.exports = seed;
