const mongoose = require('mongoose');
require('dotenv').config();

async function fixManPatel() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const db = mongoose.connection.db;
        
        // Find Man Patel
        const u = await db.collection('users').findOne({ name: /man patel/i });
        if (u) {
            // Update role to manager
            await db.collection('users').updateOne({ _id: u._id }, { $set: { role: 'manager' } });
            console.log('✅ Man Patel Role Updated to manager');
            
            // Recalculate ID
            const count = await db.collection('users').countDocuments({ role: 'manager' });
            const newId = `manager-${String(count + 1).padStart(3, '0')}.manager`;
            
            await db.collection('users').updateOne({ _id: u._id }, { $set: { employeeId: newId, status: 'active' } });
            console.log(`✅ Man Patel ID Synchronized -> ${newId}`);
        }
        
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

fixManPatel();
