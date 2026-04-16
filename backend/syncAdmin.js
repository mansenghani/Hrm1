const mongoose = require('mongoose');
require('dotenv').config();

async function syncAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const User = mongoose.connection.db.collection('users');
    const Employee = mongoose.connection.db.collection('employees');

    const admin = await User.findOne({ email: 'admin@fluidhr.com' });
    if (!admin) {
      console.log('Admin user not found');
      process.exit(1);
    }

    await Employee.updateOne(
      { userId: admin._id },
      { 
        $set: { 
          userId: admin._id,
          employeeId: 'ADM-001',
          fullName: 'System Administrator',
          email: admin.email,
          role: 'admin',
          joinDate: new Date('2026-04-01'),
          status: 'active',
          employmentType: 'Full-time'
        } 
      },
      { upsert: true }
    );

    console.log('✅ Admin Professional Identity Synchronized');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

syncAdmin();
