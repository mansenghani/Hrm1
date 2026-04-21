const mongoose = require('mongoose');
const User = require('./models/User');
const Team = require('./models/Team');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const seedPersonnel = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hrms');
        console.log('✅ Connected for Personnel Forging');

        // 🔍 Locate Man Patel (Commanding Officer)
        const manPatel = await User.findOne({ 
            $or: [{ email: 'mansenghani7@gmail.com' }, { email: 'man.patel@fluidhr.com' }] 
        });

        if (!manPatel) {
            console.error('❌ CO: Man Patel not found. Run this after creating Man Patel in UI.');
            process.exit(1);
        }

        // 🔍 Locate his Team (Tactical Unit)
        const team = await Team.findOne({ managerId: manPatel._id });

        const employees = [
            { name: 'Mission Alpha', email: 'alpha@fluidhr.com', password: 'password123', role: 'employee', employeeId: 'EMP-ALP' },
            { name: 'Mission Bravo', email: 'bravo@fluidhr.com', password: 'password123', role: 'employee', employeeId: 'EMP-BRA' },
            { name: 'Mission Charlie', email: 'charlie@fluidhr.com', password: 'password123', role: 'employee', employeeId: 'EMP-CHA' },
            { name: 'Mission Delta', email: 'delta@fluidhr.com', password: 'password123', role: 'employee', employeeId: 'EMP-DEL' },
            { name: 'Mission Echo', email: 'echo@fluidhr.com', password: 'password123', role: 'employee', employeeId: 'EMP-ECH' }
        ];

        const hashed = await bcrypt.hash('password123', 10);

        const createdEmployees = [];
        for (const emp of employees) {
            const exists = await User.findOne({ email: emp.email });
            if (!exists) {
                const newUser = await User.create({
                    ...emp,
                    password: hashed,
                    managerId: manPatel._id, // Set reporting manager
                    teamId: team?._id // Assign to his team
                });
                createdEmployees.push(newUser);
                console.log(`✅ Forged Node: ${emp.name}`);
            }
        }

        // 🔗 Correct the Team Node counts if team exists
        if (team && createdEmployees.length > 0) {
            team.members = [...new Set([...team.members, ...createdEmployees.map(e => e._id)])];
            await team.save();
            console.log(`🔗 Anchored ${createdEmployees.length} nodes to Team: ${team.teamName}`);
        }

        console.log('✅ Operational Personnel Sync Complete');
        process.exit();
    } catch (err) {
        console.error('❌ SEED ERROR:', err.message);
        process.exit(1);
    }
};

seedPersonnel();
