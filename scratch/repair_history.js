const mongoose = require('mongoose');
require('dotenv').config({ path: 'backend/.env' });

async function repairHistory() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const Task = require('../backend/models/Task');
        const User = require('../backend/models/User');
        
        const admin = await User.findOne({ role: 'admin' });
        const adminImg = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
        
        console.log('Searching for Admin traces in task history (Case-Insensitive)...');
        
        // Find all tasks that have ANY comments
        const tasks = await Task.find({ 'comments.0': { $exists: true } });
        let updatedCount = 0;
        
        for (const task of tasks) {
            let modified = false;
            task.comments.forEach(c => {
                const isSystemAdmin = c.userName && /system admin/i.test(c.userName);
                const isByAdminId = admin && c.userId?.toString() === admin._id.toString();
                
                if (isSystemAdmin || isByAdminId) {
                    if (c.profileImage !== adminImg) {
                        c.profileImage = adminImg;
                        modified = true;
                    }
                }
            });
            
            if (modified) {
                await task.save();
                updatedCount++;
            }
        }
        
        console.log(`Successfully repaired history for ${updatedCount} tasks.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

repairHistory();
