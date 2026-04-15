const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

// Models
const Admin = require('../backend/models/Admin');
const HR = require('../backend/models/HR');
const Manager = require('../backend/models/Manager');
const EmployeeUser = require('../backend/models/EmployeeUser');

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

async function resetPasswords() {
  try {
    const uri = process.env.MONGODB_URI;
    await mongoose.connect(uri);
    console.log('Connected to DB');

    const commonPass = await bcrypt.hash('admin@2026', 10);

    await Admin.updateOne({ email: 'admin@fluidhr.com' }, { password: commonPass });
    await HR.updateOne({ email: 'hr@fluidhr.com' }, { password: commonPass });
    await Manager.updateOne({ email: 'manager@fluidhr.com' }, { password: commonPass });
    await EmployeeUser.updateOne({ email: 'mansenghani7@gmail.com' }, { password: commonPass });

    console.log('All passwords reset to: admin@2026');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

resetPasswords();
