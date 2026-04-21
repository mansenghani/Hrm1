const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

const Leave = require('../backend/models/Leave');

async function fix() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const result = await mongoose.connection.db.collection('leaves').updateMany({}, { $unset: { userModel: "" } });
        console.log(`Updated ${result.modifiedCount} records.`);
        
        const leaves = await Leave.find().populate('user');
        console.log(`Found ${leaves.length} records after fix.`);
        if (leaves.length > 0) {
            console.log(`First record user: ${leaves[0].user ? leaves[0].user.name : 'Not populated'}`);
        }
    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
}

fix();
