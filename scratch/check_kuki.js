const mongoose = require('mongoose');
require('dotenv').config({ path: 'e:/kukii/backend/.env' });

async function checkKuki() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const collections = await mongoose.connection.db.listCollections().toArray();
        for (const col of collections) {
            const count = await mongoose.connection.db.collection(col.name).countDocuments();
            console.log(`Collection [${col.name}]: ${count} documents`);
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkKuki();
