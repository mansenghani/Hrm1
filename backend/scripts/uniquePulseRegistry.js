const mongoose = require('mongoose');
require('dotenv').config();

async function uniquePulseRegistry() {
    try {
        console.log('🛰️ INITIALIZING UNIQUE REGISTRY PULSE...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to Pulse Network');

        const db = mongoose.connection.db;
        
        // 1. Fetch all users
        const users = await db.collection('users').find({}).toArray();
        console.log(`🔍 Scanning ${users.length} personnel nodes...`);

        // Identity registry map
        const roleCounters = {
            admin: 0,
            hr: 0,
            manager: 0,
            employee: 0
        };

        for (const user of users) {
            const role = (user.role || 'employee').toLowerCase();
            roleCounters[role]++;
            
            const nextPadded = String(roleCounters[role]).padStart(3, '0');
            const newUniqueId = `${role}-${nextPadded}.${role}`;

            console.log(`🚧 Updating [${role.toUpperCase()}]: ${user.name || user.email} -> ${newUniqueId}`);

            // Update USER collection
            await db.collection('users').updateOne(
                { _id: user._id },
                { $set: { employeeId: newUniqueId, status: 'active' } }
            );

            // 2. Update SHADOW collections (employees, hrs, managers)
            const shadowCollections = ['employees', 'hrs', 'managers'];
            for (const coll of shadowCollections) {
                const existing = await db.collection(coll).findOne({ userId: user._id });
                if (existing) {
                    await db.collection(coll).updateOne(
                        { _id: existing._id },
                        { $set: { employeeId: newUniqueId } }
                    );
                    console.log(`   🔗 Shadow Sync [${coll}] success.`);
                }
            }
        }

        console.log('🏁 UNIQUE REGISTRY PULSE COMPLETED. ALL IDENTITIES HARD-SYNCED.');
        process.exit(0);
    } catch (error) {
        console.error('🔥 CRITICAL PULSE FAILURE:', error);
        process.exit(1);
    }
}

uniquePulseRegistry();
