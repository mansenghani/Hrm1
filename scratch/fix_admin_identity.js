const mongoose = require('mongoose');
require('dotenv').config({ path: 'backend/.env' });

async function fixAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const User = require('../backend/models/User');
        
        const result = await User.findOneAndUpdate(
            { role: 'admin' },
            { 
                name: 'System Admin',
                profileImage: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
            },
            { new: true }
        );
        
        console.log('Admin Repaired:', result);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fixAdmin();
