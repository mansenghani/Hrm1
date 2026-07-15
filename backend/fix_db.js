const mongoose = require('mongoose');

async function fix() {
  await mongoose.connect('mongodb://127.0.0.1:27017/hrms');
  const Employee = mongoose.model('Employee', new mongoose.Schema({}, {strict:false}));
  
  await Employee.updateOne({ fullName: 'System Admin' }, { $set: { designation: 'System Administrator', joinDate: new Date('2024-01-01') } });
  await Employee.updateOne({ fullName: 'HR Manager' }, { $set: { designation: 'Human Resources Manager', joinDate: new Date('2024-02-15') } });
  await Employee.updateOne({ fullName: 'Manager Lead' }, { $set: { designation: 'Operations Manager', joinDate: new Date('2024-03-10') } });
  await Employee.updateOne({ fullName: 'Staff Member' }, { $set: { designation: 'Support Staff', joinDate: new Date('2024-04-20') } });
  await Employee.updateOne({ fullName: 'krish patel' }, { $set: { designation: 'Junior Developer' } });
  await Employee.updateOne({ fullName: 'krishta patel' }, { $set: { designation: 'QA Tester' } });
  
  console.log('Fixed database records');
  process.exit(0);
}

fix();
