const mongoose = require('mongoose');
require('dotenv').config();

async function pulseRegistry() {
    try {
        console.log('🛰️ INITIALIZING REGISTRY PULSE...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to Pulse Network');

        const db = mongoose.connection.db;
        const users = await db.collection('users').find({
            $or: [
                { employeeId: { $exists: false } },
                { employeeId: 'PENDING-SYNC' },
                { employeeId: '' },
                { status: { $exists: false } },
                { status: 'PENDING-SYNC' }
            ]
        }).toArray();

        console.log(`🔍 Found ${users.length} identity nodes requiring synchronization.`);

        for (const user of users) {
            const role = user.role || 'employee';
            const count = await db.collection('users').countDocuments({ role: role });
            const newId = `${role.toLowerCase()}-${String(count + 1).padStart(3, '0')}.${role.toLowerCase()}`;
            
            await db.collection('users').updateOne(
                { _id: user._id },
                { 
                    $set: { 
                        employeeId: user.employeeId && user.employeeId !== 'PENDING-SYNC' ? user.employeeId : newId, 
                        status: 'active' 
                    } 
                }
            );
            console.log(`✅ Synchronized: ${user.name || user.email} -> ${newId} (STATUS: ACTIVE)`);
        }

        console.log('🏁 REGISTRY PULSE COMPLETED. ALL NODES SECURED.');
        process.exit(0);
    } catch (error) {
        console.error('🔥 CRITICAL PULSE FAILURE:', error);
        process.exit(1);
    }
}

pulseRegistry();
