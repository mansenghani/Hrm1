require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const syncUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to DB');

    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log(`Found ${users.length} users in 'users' collection.`);

    for (const doc of users) {
      let updates = {};
      
      // 1. Ensure 'name' exists
      if (!doc.name) {
        if (doc.profile && doc.profile.firstName) {
          updates.name = `${doc.profile.firstName} ${doc.profile.lastName || ''}`.trim();
        } else {
          updates.name = doc.email.split('@')[0];
        }
      }

      // 2. Ensure 'status' exists
      if (!doc.status) {
        updates.status = 'active';
      }

      // 3. Reset passwords to a known default for testing if they are corrupted
      // Or just re-hash them if you want, but better to set a known one.
      // We'll set 'admin123' for everything for now so the user can actually log in.
      const newHash = await bcrypt.hash('admin123', 10);
      updates.password = newHash;

      if (Object.keys(updates).length > 0) {
        await mongoose.connection.db.collection('users').updateOne(
          { _id: doc._id },
          { $set: updates }
        );
        console.log(`Updated user: ${doc.email}`);
      }
    }

    console.log('🚀 Synchronization complete! All users now have password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Sync failed:', error);
    process.exit(1);
  }
};

syncUsers();
