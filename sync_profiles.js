const mongoose = require('mongoose');
const User = require('./backend/models/User');
const Employee = require('./backend/models/Employee');
require('dotenv').config();

async function sync() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB...');

  // 1. Remove orphaned records
  await Employee.deleteMany({ userId: { $exists: false } });
  
  // 2. Sync every user
  const users = await User.find();
  let count = 1;

  for (const u of users) {
    let prefix = u.role.substring(0, 3).toUpperCase();
    if (u.role === 'admin') prefix = 'ADM';
    if (u.role === 'employee') prefix = 'EMP';
    
    const empId = `${prefix}-${String(count++).padStart(3, '0')}`;
    
    await Employee.findOneAndUpdate(
      { userId: u._id },
      { 
        userId: u._id, 
        employeeId: empId, 
        position: `${u.role.toUpperCase()} Specialist` 
      },
      { upsert: true }
    );
    console.log(`Synced: ${u.email} -> ${empId}`);
  }

  process.exit(0);
}

sync().catch(err => {
  console.error(err);
  process.exit(1);
});
