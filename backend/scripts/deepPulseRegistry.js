const mongoose = require('mongoose');
require('dotenv').config();

async function deepPulseRegistry() {
    try {
        console.log('🛰️ INITIALIZING DEEP REGISTRY PULSE...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to Pulse Network');

        const db = mongoose.connection.db;
        
        // 1. Fetch all users
        const users = await db.collection('users').find({}).toArray();
        console.log(`🔍 Scanning ${users.length} personnel nodes...`);

        for (const user of users) {
            const role = user.role || 'employee';
            
            // Generate standard ID if missing
            let currentId = user.employeeId;
            if (!currentId || currentId === 'PENDING-SYNC' || currentId === '') {
                const count = await db.collection('users').countDocuments({ role: role, employeeId: { $ne: 'PENDING-SYNC' } });
                currentId = `${role.toLowerCase()}-${String(count + 1).padStart(3, '0')}.${role.toLowerCase()}`;
            }

            // Update USER collection
            await db.collection('users').updateOne(
                { _id: user._id },
                { $set: { employeeId: currentId, status: 'active' } }
            );

            // 2. Update SHADOW collections (employees, hr, manager)
            // This is the CRITICAL fix for the white screen/pending sync issues
            const shadowCollections = ['employees', 'hrs', 'managers'];
            for (const coll of shadowCollections) {
                const existing = await db.collection(coll).findOne({ userId: user._id });
                if (existing) {
                    await db.collection(coll).updateOne(
                        { _id: existing._id },
                        { $set: { employeeId: currentId } }
                    );
                    console.log(`   🔗 Shadow Sync [${coll}]: ${user.name} -> ${currentId}`);
                }
            }

            console.log(`✅ Pulse Finalized: ${user.name || user.email} -> ${currentId}`);
        }

        console.log('🏁 DEEP REGISTRY PULSE COMPLETED. ALL CORES SYNCHRONIZED.');
        process.exit(0);
    } catch (error) {
        console.error('🔥 CRITICAL PULSE FAILURE:', error);
        process.exit(1);
    }
}

deepPulseRegistry();
