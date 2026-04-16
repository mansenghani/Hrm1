require('dotenv').config();
const mongoose = require('mongoose');

const dropLegacyCollections = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const collectionsToDrop = ['admins', 'hrs', 'managers', 'employeeusers'];
        const existingCollections = (await mongoose.connection.db.listCollections().toArray()).map(c => c.name);

        for (const coll of collectionsToDrop) {
            if (existingCollections.includes(coll)) {
                await mongoose.connection.db.dropCollection(coll);
                console.log(`🗑️ Dropped legacy collection: ${coll}`);
            } else {
                console.log(`⏩ Collection ${coll} does not exist, skipping.`);
            }
        }

        console.log('✨ Cleanup complete! Only unified collections remain.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to drop collections:', error);
        process.exit(1);
    }
};

dropLegacyCollections();
