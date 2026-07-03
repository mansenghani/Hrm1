require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  
  // Find all users
  const users = await db.collection('users').find({}).toArray();
  console.log('--- USERS IN DB ---');
  for (let u of users) {
    console.log(`Email: ${u.email} | Role: ${u.role}`);
  }
  
  // Find all HRs
  const hrs = await db.collection('hrs').find({}).toArray();
  console.log('\n--- HRS IN DB ---');
  for (let h of hrs) {
    console.log(`Email: ${h.email} | Role: ${h.role}`);
  }

  process.exit(0);
}

run().catch(console.error);
