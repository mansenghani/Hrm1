require('dotenv').config({path:'backend/.env'});
const mongoose = require('mongoose');

async function syncTasks() {
  await mongoose.connect(process.env.MONGODB_URI);
  const manager = await mongoose.connection.collection('users').findOne({ role: 'manager' });
  if (manager) {
    await mongoose.connection.collection('tasks').updateMany({}, { $set: { assignedManager: manager._id } });
    console.log(`TASKS RE-ASSIGNED TO: ${manager.name}`);
  }
  process.exit(0);
}

syncTasks();
