require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Employee = require('./models/Employee');

async function extract() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('--- USER REGISTRY (AUTH NODES) ---');
        const users = await User.find({}, 'email role _id');
        users.forEach(u => {
            console.log(`[${u.role.toUpperCase()}] ${u.email} -> ID: ${u._id}`);
        });

        console.log('\n--- EMPLOYEE REGISTRY (PERSONNEL NODES) ---');
        const employees = await Employee.find({}, 'email name _id');
        employees.forEach(e => {
            console.log(`NAME: ${e.name} (${e.email}) -> ID: ${e._id}`);
        });

    } catch (err) {
        console.error('Extraction Error:', err);
    } finally {
        mongoose.connection.close();
    }
}

extract();
