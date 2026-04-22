const mongoose = require('mongoose');
require('dotenv').config({ path: 'backend/.env' });

async function countUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const User = require('../backend/models/User');
        const count = await User.countDocuments();
        const rawEmployee = await mongoose.connection.db.collection('employees').findOne();
        console.log('\n--- Raw Employee Document ---');
        console.log(JSON.stringify(rawEmployee, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

countUsers();
