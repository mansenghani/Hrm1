const mongoose = require('mongoose');
const User = require('../backend/models/User');
const Leave = require('../backend/models/Leave');

async function checkHierarchy() {
  try {
    const uri = 'mongodb://mansenghani6_db_user:gzpvaOFjPZoMFvvs@ac-tsxj5ve-shard-00-00.zcawqhy.mongodb.net:27017,ac-tsxj5ve-shard-00-01.zcawqhy.mongodb.net:27017,ac-tsxj5ve-shard-00-02.zcawqhy.mongodb.net:27017/hrm?ssl=true&replicaSet=atlas-9lp5j7-shard-0&authSource=admin&appName=Cluster0';
    await mongoose.connect(uri);
    console.log('Connected to DB');

    const users = await User.find({}, 'name email role reportingManager');
    console.log('\n--- USERS ---');
    users.forEach(u => {
      console.log(`${u.name} (${u.role}) - Manager: ${u.reportingManager || 'NONE'}`);
    });

    const leaves = await Leave.find({}).populate('user', 'name').populate('managerId', 'name');
    console.log('\n--- LEAVES ---');
    leaves.forEach(l => {
      console.log(`User: ${l.user?.name || 'Unknown'} | Manager: ${l.managerId?.name || 'NONE'} | Status: ${l.status}`);
    });

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkHierarchy();
