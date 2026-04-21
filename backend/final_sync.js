const mongoose = require('mongoose');
const User = require('./models/User');
const Team = require('./models/Team');
require('dotenv').config();

const finalSync = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hrms');
        console.log('✅ Connected for Omni-Sync Final Resolution');

        const teamId = '69e0c2c9558d007509a962d4';
        
        // 1. Gather all employee-restricted nodes
        const emps = await User.find({ role: 'employee' });
        const empIds = emps.map(e => e._id);

        console.log(`--- OMNI SYNC ---
Target Team: ${teamId}
Population: ${empIds.length} Nodes`);

        // 2. Explicitly Re-Forge the Team Registry
        await Team.findByIdAndUpdate(teamId, { 
            members: empIds,
            status: 'active' 
        });

        // 3. Anchor ALL employees back to this team
        await User.updateMany(
            { _id: { $in: empIds } },
            { teamId: teamId }
        );

        // 4. Ensure BOTH Man Patel identities point to this team
        await User.updateMany(
            { name: /Man Patel/i },
            { teamId: teamId }
        );

        console.log('✅ Final Sync Success. Mission specialists should now be visible in ALL terminals.');
        process.exit();
    } catch (e) {
        console.error('❌ FINAL SYNC ERROR:', e.message);
        process.exit(1);
    }
};

finalSync();
