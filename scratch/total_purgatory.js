const mongoose = require('mongoose');
require('dotenv').config({ path: 'backend/.env' });

async function totalPurgatory() {
    try {
        console.log('🛰️ INITIALIZING TOTAL PURGATORY PROTOCOL...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to Pulse Registry');

        // 📋 All collections that handle identity or operational data
        const collections = ['users', 'employees', 'hrs', 'managers', 'tasks', 'notifications', 'projects', 'attendances', 'timetracks'];
        
        for (const colName of collections) {
            try {
                const result = await mongoose.connection.db.collection(colName).deleteMany({});
                console.log(`💀 Purged ${colName}: ${result.deletedCount} nodes removed.`);
            } catch (colErr) {
                console.warn(`⚠️ Collection ${colName} not found or skipped.`);
            }
        }

        console.log('\n🌟 RE-INITIALIZING SYSTEM ADMIN...');
        const User = require('../backend/models/User');
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('admin123', 10);

        const admin = new User({
            name: 'System Admin',
            email: 'admin@fluidhr.com',
            password: hashedPassword,
            role: 'admin',
            employeeId: 'ADM-001',
            status: 'active',
            profileImage: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
        });

        await admin.save();
        console.log('✅ System Admin Restored: ADM-001 | admin@fluidhr.com');

        console.log('\n🏁 PURGATORY COMPLETED. ALL REGISTRIES ARE FRESH.');
        process.exit(0);
    } catch (err) {
        console.error('🔥 CRITICAL FAILURE:', err);
        process.exit(1);
    }
}

totalPurgatory();
