const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: 'backend/.env' });

async function initializeCoreTeam() {
    try {
        console.log('🛰️ INITIALIZING FORCE-WIPE & CORE TEAM SYNTHESIS...');
        await mongoose.connect(process.env.MONGODB_URI);
        
        // 💀 PURGE ALL GHOSTS FIRST
        const collections = ['users', 'employees', 'hrs', 'managers', 'tasks', 'notifications'];
        for (const col of collections) {
            try {
                await mongoose.connection.db.dropCollection(col);
                console.log(`💀 Purged ${col} collection.`);
            } catch (e) {
                console.warn(`⚠️ ${col} collection was already clean.`);
            }
        }

        const User = require('../backend/models/User');
        const Employee = require('../backend/models/Employee');
        const Manager = require('../backend/models/Manager');
        const HR = require('../backend/models/HR');

        const coreTeam = [
            { name: 'Dhruv Mehta', email: 'dhruv.mehta@fluidhr.com', id: 'AT_EMP_1', role: 'admin' },
            { name: 'Kalpesh Patel', email: 'kalpesh.patel@fluidhr.com', id: 'AT_EMP_2', role: 'manager' },
            { name: 'Rishi Patel', email: 'rishi.patel@fluidhr.com', id: 'AT_EMP_3', role: 'manager' },
            { name: 'Man Senghani', email: 'man.senghani@fluidhr.com', id: 'AT_EMP_4', role: 'hr' },
            { name: 'Jay Shah', email: 'jay.shah@fluidhr.com', id: 'AT_EMP_5', role: 'employee' },
            { name: 'Bhavik Kukadiya', email: 'bhavik.kukadiya@fluidhr.com', id: 'AT_EMP_6', role: 'employee' }
        ];

        const password = await bcrypt.hash('pass123', 10);

        for (const member of coreTeam) {
            console.log(`📡 Registering Node: ${member.id} | ${member.name}...`);
            
            const user = new User({
                name: member.name,
                email: member.email,
                password: password,
                role: member.role,
                employeeId: member.id,
                status: 'active'
            });
            const savedUser = await user.save();

            const profile = new Employee({
                userId: savedUser._id,
                fullName: member.name,
                email: member.email,
                employeeId: member.id,
                role: member.role,
                joinDate: new Date()
            });
            await profile.save();

            if (member.role === 'manager') {
                await new Manager({ userId: savedUser._id, department: 'Operations' }).save();
            } else if (member.role === 'hr') {
                await new HR({ userId: savedUser._id, hrId: member.id }).save();
            }
        }

        // 🌟 Also restore the generic System Admin for stability
        console.log('🌟 RESTORING SYSTEM ADMIN...');
        const adminPass = await bcrypt.hash('admin123', 10);
        const sysAdmin = new User({
            name: 'System Admin',
            email: 'admin@fluidhr.com',
            password: adminPass,
            role: 'admin',
            employeeId: 'ADM-001',
            status: 'active'
        });
        const savedSysAdmin = await sysAdmin.save();
        await new Employee({
            userId: savedSysAdmin._id,
            fullName: 'System Admin',
            email: 'admin@fluidhr.com',
            employeeId: 'ADM-001',
            role: 'admin'
        }).save();

        console.log('\n🏁 CORE TEAM SYNTHESIS COMPLETED. ALL NODES SECURED.');
        process.exit(0);
    } catch (err) {
        console.error('🔥 CRITICAL FAILURE:', err);
        process.exit(1);
    }
}

initializeCoreTeam();
