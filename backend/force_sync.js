const mongoose = require('mongoose');
const User = require('./models/User');
const Team = require('./models/Team');
require('dotenv').config();

const forceSync = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hrms');
        console.log('✅ Connected for Force-Sync');

        // 1. Find Man Patel
        const mgr = await User.findOne({ name: /Man Patel/i, role: 'manager' });
        if (!mgr) throw new Error('CO: Man Patel not found');

        // 2. Find his Team (or create it if needed)
        let team = await Team.findOne({ managerId: mgr._id });
        if (!team) {
            team = await Team.create({ 
                teamName: 'Tactical Team Alpha', 
                managerId: mgr._id, 
                department: 'Core OPS', 
                createdBy: mgr._id 
            });
            console.log('✅ Forged missing Team Registry');
        }

        // 3. Find the 5 Seeding Employees
        const emps = await User.find({ email: /fluidhr.com/ });
        if (emps.length === 0) throw new Error('No forged personnel nodes found');

        // 4. Update Hierarchies
        await User.findByIdAndUpdate(mgr._id, { teamId: team._id });
        
        const empIds = emps.map(e => e._id);
        await User.updateMany(
            { _id: { $in: empIds } },
            { teamId: team._id, managerId: mgr._id }
        );

        // 5. Update Team Members
        team.members = empIds;
        await team.save();

        console.log(`✅ Force-Sync Success: ${empIds.length} nodes anchored to ${mgr.name}`);
        process.exit();
    } catch (err) {
        console.error('❌ SYNC ERROR:', err.message);
        process.exit(1);
    }
};

forceSync();
