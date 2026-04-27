const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: 'backend/.env' });

async function hardReset() {
    try {
        console.log('🛰️ INITIALIZING HARD SCHEMA RESET...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to Pulse Network');

        const collections = ['hrs', 'managers', 'employees', 'users'];
        
        for (const colName of collections) {
            try {
                await mongoose.connection.db.dropCollection(colName);
                console.log(`💀 Collection ${colName} DROPPED. Ghosts purged.`);
            } catch (err) {
                console.warn(`⚠️ Collection ${colName} was already clean.`);
            }
        }

        console.log('\n🌟 RE-INITIALIZING SYSTEM ADMIN...');
        const User = require('../backend/models/User');
        const Employee = require('../backend/models/Employee');
        const hashedPassword = await bcrypt.hash('admin123', 10);

        const adminUser = new User({
            name: 'System Admin',
            email: 'admin@fluidhr.com',
            password: hashedPassword,
            role: 'admin',
            employeeId: 'ADM-001',
            status: 'active',
            profileImage: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
        });

        const savedAdmin = await adminUser.save();
        
        // 🛡️ Create the base employee profile for the Admin too
        const adminProfile = new Employee({
            userId: savedAdmin._id,
            fullName: 'System Admin',
            email: 'admin@fluidhr.com',
            employeeId: 'ADM-001',
            role: 'admin',
            joinDate: new Date()
        });
        await adminProfile.save();

        console.log('✅ System Admin Restored: ADM-001 | admin@fluidhr.com');
        console.log('\n🏁 HARD RESET COMPLETED. REGISTRY IS FRESH.');
        process.exit(0);
    } catch (err) {
        console.error('🔥 CRITICAL FAILURE:', err);
        process.exit(1);
    }
}

hardReset();
