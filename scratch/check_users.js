const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Models
const Admin = require('../backend/models/Admin');
const HR = require('../backend/models/HR');
const Manager = require('../backend/models/Manager');
const EmployeeUser = require('../backend/models/EmployeeUser');

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

async function checkUsers() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI not found in env');
    
    await mongoose.connect(uri);
    console.log('Connected to DB');

    const admins = await Admin.find({}, 'email');
    const hrs = await HR.find({}, 'email');
    const managers = await Manager.find({}, 'email');
    const emps = await EmployeeUser.find({}, 'email');

    console.log('Admins:', admins);
    console.log('HRs:', hrs);
    console.log('Managers:', managers);
    console.log('Employees:', emps);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkUsers();
