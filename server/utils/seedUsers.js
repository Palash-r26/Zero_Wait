const bcrypt = require('bcryptjs');
const User = require('../models/User');

const seedUsers = async () => {
  try {
    const count = await User.countDocuments();
    if (count > 0) {
      console.log('   └─ User collection not empty, skipping user seed.');
      return;
    }

    const adminPassword = await bcrypt.hash('admin123', 10);
    const staffPassword = await bcrypt.hash('staff123', 10);

    const initialUsers = [
      { username: 'admin', password: adminPassword, role: 'admin' },
      { username: 'staff', password: staffPassword, role: 'staff' },
    ];

    await User.insertMany(initialUsers);
    console.log('   └─ Default users created: admin, staff (passwords: admin123, staff123)');
  } catch (err) {
    console.error('   └─ Error seeding users:', err.message);
  }
};

module.exports = seedUsers;
