require('dotenv').config({ path: 'backend/.env' });
const mongoose = require('mongoose');

async function resetSystem() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🚀 TOTAL SYSTEM WIPE INITIATED');

    const collections = [
      'employees',
      'managers',
      'hrs',
      'tasks',
      'projects',
      'attendances',
      'leaves',
      'timetracks',
      'notifications',
      'payrolls',
      'teams',
      'leavebalances',
      'departments'
    ];

    for (const coll of collections) {
      try {
        const res = await mongoose.connection.collection(coll).deleteMany({});
        console.log(`CLEANED: ${coll} (${res.deletedCount} records)`);
      } catch (e) {
        console.log(`SKIP: ${coll}`);
      }
    }

    // Purge non-admin users
    try {
      const res = await mongoose.connection.collection('users').deleteMany({ role: { $ne: 'admin' } });
      console.log(`PURGED: ${res.deletedCount} Non-Admin Users`);
    } catch (e) {
      console.log('ERROR: User purge failed');
    }

    console.log('✨ SYSTEM RESET COMPLETE - TRUE ZERO REACHED');
    process.exit(0);
  } catch (error) {
    console.error('CRITICAL FAILURE:', error);
    process.exit(1);
  }
}

resetSystem();
