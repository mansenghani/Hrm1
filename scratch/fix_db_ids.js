const mongoose = require('mongoose');
require('dotenv').config({ path: 'backend/.env' });

async function fixIds() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const db = mongoose.connection.db;
        
        const employees = await db.collection('employees').find().toArray();
        for (const emp of employees) {
            let updates = {};
            if (emp.userId && !(emp.userId instanceof mongoose.Types.ObjectId) && typeof emp.userId === 'string') {
                updates.userId = new mongoose.Types.ObjectId(emp.userId);
            }
            if (emp.managerId && !(emp.managerId instanceof mongoose.Types.ObjectId) && typeof emp.managerId === 'string') {
                updates.managerId = new mongoose.Types.ObjectId(emp.managerId);
            }
            if (Object.keys(updates).length > 0) {
                console.log(`Fixing Employee: ${emp.fullName || emp.email}`);
                await db.collection('employees').updateOne({ _id: emp._id }, { $set: updates });
            }
        }
        
        const tasks = await db.collection('tasks').find().toArray();
        for (const task of tasks) {
            let updates = {};
            ['assignedManager', 'assignedEmployee', 'createdBy'].forEach(field => {
                if (task[field] && typeof task[field] === 'string') {
                    updates[field] = new mongoose.Types.ObjectId(task[field]);
                }
            });
            if (Array.isArray(task.assignedEmployees)) {
                updates.assignedEmployees = task.assignedEmployees.map(id => typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id);
            }
            if (Object.keys(updates).length > 0) {
                console.log(`Fixing Task: ${task.title}`);
                await db.collection('tasks').updateOne({ _id: task._id }, { $set: updates });
            }
        }

        console.log('✨ Database Integrity Sync Complete');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fixIds();
